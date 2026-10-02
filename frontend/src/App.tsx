import { useEffect, useState } from "react";
import { getMyRides } from "./api/rides";
import CreateRide from "./pages/CreateRide";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [showRidePage, setShowRidePage] = useState(false);

  const [rides, setRides] = useState<unknown[]>([]);
  const [rideError, setRideError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const loadRides = async () => {
      try {
        const result = await getMyRides();

        console.log("My rides:", result);

        setRides(result.rides || result.data || []);
      } catch (error) {
        console.error("Failed to load rides:", error);

        setRideError(
          error instanceof Error ? error.message : "Failed to load rides",
        );
      }
    };

    loadRides();
  }, []);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  if (showRidePage && isLoggedIn) {
    return (
      <div>
        <CreateRide
          onRideCreated={async () => {
            try {
              const result = await getMyRides();

              setRides(result.rides || result.data || []);
              setShowRidePage(false);
            } catch (error) { 
              console.error("Failed to refresh rides:", error);
            }
          }}
        />

        <button onClick={() => setShowRidePage(false)}>Back</button>
      </div>
    );
  }

  return (
    <div>
      {showLogin ? <Login /> : <Register />}

      <button onClick={() => setShowLogin(!showLogin)}>
        {showLogin ? "Create a new account" : "Already have an account? Login"}
      </button>

      {isLoggedIn && (
        <div>
          <button onClick={() => setShowRidePage(true)}>Book a Ride 🚗</button>

          <h2>My Rides</h2>

          {rideError && <p>{rideError}</p>}

          {!rideError && rides.length === 0 && <p>No rides found.</p>}

          {rides.map((ride, index) => (
            <pre key={index}>{JSON.stringify(ride, null, 2)}</pre>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
