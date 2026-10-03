import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import {
  getMyRides,
  getAvailableRides,
  getDriverRides,
  acceptRide,
  updateRideStatus,
  cancelRide,
  type RideItem,
} from "./api/rides";
import type { LoggedInUser } from "./pages/Login";
import CreateRide from "./pages/CreateRide";
import Login from "./pages/Login";
import Register from "./pages/Register";

const socket = io("http://localhost:5000", {
  autoConnect: true,
});

interface RideUpdatePayload {
  rideId: string;
  status: string;
  message: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showLogin, setShowLogin] = useState(true);
  const [showRidePage, setShowRidePage] = useState(false);
  const [rides, setRides] = useState<RideItem[]>([]);
  const [availableRides, setAvailableRides] = useState<RideItem[]>([]);
  const [driverRides, setDriverRides] = useState<RideItem[]>([]);
  const [rideError, setRideError] = useState("");
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const [rideUpdate, setRideUpdate] = useState<RideUpdatePayload | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setRideError("");
      if (currentUser.role === "CUSTOMER") {
        const result = await getMyRides();
        setRides(result.rides || result.data || []);
      } else if (currentUser.role === "DRIVER") {
        const [availResult, assignedResult] = await Promise.all([
          getAvailableRides(),
          getDriverRides(),
        ]);
        setAvailableRides(availResult.rides || []);
        setDriverRides(assignedResult.rides || []);
      }
    } catch (error) {
      console.error("Failed to load rides data:", error);
      setRideError(
        error instanceof Error ? error.message : "Failed to load rides",
      );
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const joinRoom = () => {
      console.log(`Socket joining room user:${currentUser._id}`);
      socket.emit("join-user-room", currentUser._id);
    };

    if (socket.connected) {
      setSocketConnected(true);
      joinRoom();
    }

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
      joinRoom();
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };

    const handleWelcome = (data: { message: string }) => {
      console.log("Real-time message:", data.message);
    };

    const handleRideUpdate = (data: RideUpdatePayload) => {
      console.log("🚗 Ride update received:", data);
      setRideUpdate(data);

      // Optimistically update existing rides list
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === data.rideId
            ? { ...ride, status: data.status as RideItem["status"] }
            : ride,
        ),
      );

      // Reload full ride details from backend
      loadData();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("welcome", handleWelcome);
    socket.on("ride-update", handleRideUpdate);

    loadData();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("welcome", handleWelcome);
      socket.off("ride-update", handleRideUpdate);
    };
  }, [currentUser, loadData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setRides([]);
    setAvailableRides([]);
    setDriverRides([]);
    setRideUpdate(null);
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      await acceptRide(rideId);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to accept ride");
    }
  };

  const handleUpdateStatus = async (
    rideId: string,
    status: "DRIVER_ARRIVING" | "IN_PROGRESS" | "COMPLETED",
  ) => {
    try {
      await updateRideStatus(rideId, status);
      await loadData();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update ride status",
      );
    }
  };

  const handleCancelRide = async (rideId: string) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    try {
      await cancelRide(rideId);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to cancel ride");
    }
  };

  // Not logged in view
  if (!currentUser) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        {showLogin ? (
          <Login
            onLoginSuccess={(user) => {
              setCurrentUser(user);
            }}
          />
        ) : (
          <Register />
        )}

        <div style={{ marginTop: "15px" }}>
          <button onClick={() => setShowLogin(!showLogin)}>
            {showLogin ? "Create a new account" : "Already have an account? Login"}
          </button>
        </div>

        <div style={{ marginTop: "25px", padding: "12px", border: "1px dashed #aaa", borderRadius: "6px" }}>
          <small>
            <strong>Quick Demo Credentials:</strong><br />
            👤 Customer: <code>customer@example.com</code> / <code>password123</code><br />
            🚗 Driver: <code>driver@example.com</code> / <code>password123</code>
          </small>
        </div>
      </div>
    );
  }

  // Create Ride View
  if (showRidePage && currentUser.role === "CUSTOMER") {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
        <button onClick={() => setShowRidePage(false)}>← Back to Dashboard</button>
        <CreateRide
          onRideCreated={async () => {
            await loadData();
            setShowRidePage(false);
          }}
        />
      </div>
    );
  }

  // Logged-in View
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: "0 0 5px 0" }}>Safarnama AI 🚀</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Logged in as: <strong>{currentUser.name}</strong> ({currentUser.email}) &bull; Role: <strong>{currentUser.role}</strong>
          </p>
          <small>
            Real-Time Socket: {socketConnected ? "🟢 Connected" : "🔴 Disconnected"} (Room: <code>user:{currentUser._id}</code>)
          </small>
        </div>
        <div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      {/* Real-time alert notification banner */}
      {rideUpdate && (
        <div style={{
          backgroundColor: "#e6f4ea",
          border: "2px solid #34a853",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
          animation: "fadeIn 0.3s ease-in-out"
        }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#137333" }}>
            🚗 Live Ride Update
          </h3>
          <p style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
            <strong>Status:</strong>{" "}
            <span style={{
              backgroundColor: "#137333",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "13px"
            }}>
              {rideUpdate.status}
            </span>
          </p>
          <p style={{ margin: "0 0 5px 0" }}>{rideUpdate.message}</p>
          <small style={{ color: "#555" }}>Ride ID: {rideUpdate.rideId}</small>
        </div>
      )}

      {/* Customer Interface */}
      {currentUser.role === "CUSTOMER" && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>My Rides</h2>
            <button
              onClick={() => setShowRidePage(true)}
              style={{
                backgroundColor: "#1a73e8",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Book a Ride 🚗
            </button>
          </div>

          {rideError && <p style={{ color: "red" }}>{rideError}</p>}

          {!rideError && rides.length === 0 && (
            <p style={{ color: "#666" }}>You have not requested any rides yet. Click &quot;Book a Ride&quot; above!</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>
                    {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                  </strong>
                  <span
                    style={{
                      backgroundColor:
                        ride.status === "COMPLETED"
                          ? "#34a853"
                          : ride.status === "CANCELLED"
                          ? "#ea4335"
                          : ride.status === "REQUESTED"
                          ? "#fbbc04"
                          : "#1a73e8",
                      color: ride.status === "REQUESTED" ? "#000" : "#fff",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {ride.status}
                  </span>
                </div>

                <div style={{ fontSize: "14px", color: "#444", marginBottom: "8px" }}>
                  Fare: <strong>₹{ride.fare}</strong>
                  {ride.driver && (
                    <span style={{ marginLeft: "15px" }}>
                      Driver: <strong>{ride.driver.name}</strong> ({ride.driver.email})
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ color: "#777" }}>ID: {ride._id}</small>

                  {["REQUESTED", "ACCEPTED", "DRIVER_ARRIVING"].includes(ride.status) && (
                    <button
                      onClick={() => handleCancelRide(ride._id)}
                      style={{
                        backgroundColor: "#ea4335",
                        color: "#fff",
                        border: "none",
                        padding: "5px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Driver Interface */}
      {currentUser.role === "DRIVER" && (
        <section>
          <h2>Driver Console 🚗</h2>

          {rideError && <p style={{ color: "red" }}>{rideError}</p>}

          <div style={{ marginBottom: "30px" }}>
            <h3>Available Rides to Accept</h3>
            {availableRides.length === 0 ? (
              <p style={{ color: "#666" }}>No requested rides available at the moment.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {availableRides.map((ride) => (
                  <div
                    key={ride._id}
                    style={{
                      border: "1px solid #1a73e8",
                      borderRadius: "8px",
                      padding: "15px",
                      backgroundColor: "#f8fafd",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </strong>
                      <div style={{ fontSize: "14px", marginTop: "4px" }}>
                        Fare: <strong>₹{ride.fare}</strong> | Customer:{" "}
                        {ride.customer?.name || "Customer"}
                      </div>
                      <small style={{ color: "#666" }}>ID: {ride._id}</small>
                    </div>
                    <button
                      onClick={() => handleAcceptRide(ride._id)}
                      style={{
                        backgroundColor: "#34a853",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Accept Ride 🚕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3>My Assigned Rides</h3>
            {driverRides.length === 0 ? (
              <p style={{ color: "#666" }}>You have not accepted any rides yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {driverRides.map((ride) => (
                  <div
                    key={ride._id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "15px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>
                        {ride.pickupLocation} &rarr; {ride.dropoffLocation}
                      </strong>
                      <span
                        style={{
                          backgroundColor:
                            ride.status === "COMPLETED"
                              ? "#34a853"
                              : ride.status === "CANCELLED"
                              ? "#ea4335"
                              : "#1a73e8",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {ride.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                      Fare: <strong>₹{ride.fare}</strong> | Customer: {ride.customer?.name} ({ride.customer?.email})
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {ride.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateStatus(ride._id, "DRIVER_ARRIVING")}
                          style={{
                            backgroundColor: "#fbbc04",
                            color: "#000",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Mark Driver Arriving 📍
                        </button>
                      )}

                      {ride.status === "DRIVER_ARRIVING" && (
                        <button
                          onClick={() => handleUpdateStatus(ride._id, "IN_PROGRESS")}
                          style={{
                            backgroundColor: "#1a73e8",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Start Ride (In Progress) 🚗
                        </button>
                      )}

                      {ride.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleUpdateStatus(ride._id, "COMPLETED")}
                          style={{
                            backgroundColor: "#34a853",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Complete Ride ✅
                        </button>
                      )}

                      {ride.status === "COMPLETED" && (
                        <span style={{ color: "#34a853", fontWeight: "bold" }}>
                          ✓ Ride Completed
                        </span>
                      )}

                      {ride.status === "CANCELLED" && (
                        <span style={{ color: "#ea4335", fontWeight: "bold" }}>
                          🚫 Ride Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
