const io = require("D:/safarnama-ai/frontend/node_modules/socket.io-client");

const API_BASE = "http://localhost:5000/api";

async function postJson(url, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

async function patchJson(url, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

async function getJson(url, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json;
}

function waitForEvent(socket, eventName, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for socket event: ${eventName}`));
    }, timeoutMs);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log("🚀 TRAVEL NEXUS - REAL-TIME RIDE LIFECYCLE TEST");
  console.log("==================================================");

  // 1. Health check
  console.log("\n[1/8] Checking backend health...");
  const health = await getJson(`${API_BASE}/health`);
  console.log("✅ Health response:", health.message);

  // 2. Authenticate Customer
  console.log("\n[2/8] Logging in Customer (customer@example.com)...");
  const customerAuth = await postJson(`${API_BASE}/auth/login`, {
    email: "customer@example.com",
    password: "password123",
  });
  const customerToken = customerAuth.token;
  const customerId = customerAuth.user._id;
  console.log(`✅ Customer logged in: ID = ${customerId}, Name = ${customerAuth.user.name}`);

  // 3. Authenticate Driver
  console.log("\n[3/8] Logging in Driver (driver@example.com)...");
  const driverAuth = await postJson(`${API_BASE}/auth/login`, {
    email: "driver@example.com",
    password: "password123",
  });
  const driverToken = driverAuth.token;
  const driverId = driverAuth.user._id;
  console.log(`✅ Driver logged in: ID = ${driverId}, Name = ${driverAuth.user.name}`);

  // 4. Connect Customer via Socket.IO and join user room
  console.log("\n[4/8] Connecting Customer to Socket.IO (http://localhost:5000)...");
  const customerSocket = io("http://localhost:5000", {
    transports: ["websocket", "polling"],
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Socket connection timeout")), 5000);
    customerSocket.on("connect", () => {
      clearTimeout(timer);
      console.log(`✅ Customer Socket connected: socket.id = ${customerSocket.id}`);
      resolve();
    });
  });

  customerSocket.emit("join-user-room", customerId);
  console.log(`✅ Customer joined dynamic room: user:${customerId}`);

  // Listen and log all ride updates
  const receivedUpdates = [];
  customerSocket.on("ride-update", (update) => {
    console.log("  🔔 [REAL-TIME EVENT RECEIVED]", JSON.stringify(update));
    receivedUpdates.push(update);
  });

  // 5. Customer creates a new ride
  console.log("\n[5/8] Customer creating ride request...");
  const createRideRes = await postJson(
    `${API_BASE}/rides`,
    {
      pickupLocation: "Connaught Place, Delhi",
      dropoffLocation: "Cyber Hub, Gurgaon",
      fare: 550,
    },
    customerToken
  );
  const ride = createRideRes.ride;
  console.log(`✅ Ride created: ID = ${ride._id}, Status = ${ride.status}, Fare = ₹${ride.fare}`);

  // 6. Driver checks available rides
  console.log("\n[6/8] Driver checking available rides...");
  const availRes = await getJson(`${API_BASE}/rides/available`, driverToken);
  const foundInAvail = availRes.rides.find((r) => r._id === ride._id);
  if (!foundInAvail) {
    throw new Error(`Ride ${ride._id} not found in driver's available rides!`);
  }
  console.log(`✅ Ride ${ride._id} confirmed in Driver's available list.`);

  // 7. Test the sequential lifecycle transitions with real-time events
  console.log("\n[7/8] Executing real-time status progression...");

  // --- Step 7A: Driver ACCEPTS the ride ---
  console.log("\n  -> Step 7A: Driver accepts ride...");
  let updatePromise = waitForEvent(customerSocket, "ride-update");
  const acceptRes = await patchJson(`${API_BASE}/rides/${ride._id}/accept`, null, driverToken);
  console.log("     Backend response:", acceptRes.message, "| status:", acceptRes.ride.status);
  let event = await updatePromise;
  console.log(`     ✅ Customer received real-time event: status = "${event.status}", message = "${event.message}"`);
  if (event.status !== "ACCEPTED") throw new Error(`Expected ACCEPTED, got ${event.status}`);

  // --- Step 7B: Driver updates to DRIVER_ARRIVING ---
  console.log("\n  -> Step 7B: Driver updates status to DRIVER_ARRIVING...");
  updatePromise = waitForEvent(customerSocket, "ride-update");
  const arrivingRes = await patchJson(
    `${API_BASE}/rides/${ride._id}/status`,
    { status: "DRIVER_ARRIVING" },
    driverToken
  );
  console.log("     Backend response:", arrivingRes.message, "| status:", arrivingRes.ride.status);
  event = await updatePromise;
  console.log(`     ✅ Customer received real-time event: status = "${event.status}", message = "${event.message}"`);
  if (event.status !== "DRIVER_ARRIVING") throw new Error(`Expected DRIVER_ARRIVING, got ${event.status}`);

  // --- Step 7C: Driver updates to IN_PROGRESS ---
  console.log("\n  -> Step 7C: Driver updates status to IN_PROGRESS...");
  updatePromise = waitForEvent(customerSocket, "ride-update");
  const inProgressRes = await patchJson(
    `${API_BASE}/rides/${ride._id}/status`,
    { status: "IN_PROGRESS" },
    driverToken
  );
  console.log("     Backend response:", inProgressRes.message, "| status:", inProgressRes.ride.status);
  event = await updatePromise;
  console.log(`     ✅ Customer received real-time event: status = "${event.status}", message = "${event.message}"`);
  if (event.status !== "IN_PROGRESS") throw new Error(`Expected IN_PROGRESS, got ${event.status}`);

  // --- Step 7D: Driver updates to COMPLETED ---
  console.log("\n  -> Step 7D: Driver updates status to COMPLETED...");
  updatePromise = waitForEvent(customerSocket, "ride-update");
  const completedRes = await patchJson(
    `${API_BASE}/rides/${ride._id}/status`,
    { status: "COMPLETED" },
    driverToken
  );
  console.log("     Backend response:", completedRes.message, "| status:", completedRes.ride.status);
  event = await updatePromise;
  console.log(`     ✅ Customer received real-time event: status = "${event.status}", message = "${event.message}"`);
  if (event.status !== "COMPLETED") throw new Error(`Expected COMPLETED, got ${event.status}`);

  // Verify final ride details from customer's perspective
  console.log("\n  -> Verifying final ride details via Customer API...");
  const myRidesRes = await getJson(`${API_BASE}/rides/my`, customerToken);
  const finalRide = myRidesRes.rides.find((r) => r._id === ride._id);
  console.log(`     Status: ${finalRide.status}`);
  console.log(`     Driver: ${finalRide.driver?.name} (${finalRide.driver?.email})`);
  if (finalRide.status !== "COMPLETED") throw new Error("Ride is not completed in customer history!");

  // 8. Test Cancellation Flow with Real-Time Event
  console.log("\n[8/8] Testing Ride Cancellation Real-Time Event...");
  const cancelRideReq = await postJson(
    `${API_BASE}/rides`,
    {
      pickupLocation: "Aerocity Metro",
      dropoffLocation: "Terminal 3 IGI",
      fare: 150,
    },
    customerToken
  );
  const cancelRideId = cancelRideReq.ride._id;
  console.log(`     Created new ride to cancel: ${cancelRideId}`);

  updatePromise = waitForEvent(customerSocket, "ride-update");
  const cancelRes = await patchJson(`${API_BASE}/rides/${cancelRideId}/cancel`, null, customerToken);
  console.log("     Backend response:", cancelRes.message);
  event = await updatePromise;
  console.log(`     ✅ Customer received real-time cancellation event: status = "${event.status}", message = "${event.message}"`);
  if (event.status !== "CANCELLED") throw new Error(`Expected CANCELLED, got ${event.status}`);

  customerSocket.disconnect();

  console.log("\n==================================================");
  console.log("🎉 ALL REAL-TIME RIDE TESTS PASSED SUCCESSFULLY!");
  console.log(`Total real-time events verified: ${receivedUpdates.length} (4 lifecycle + 1 cancellation)`);
  console.log("==================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
