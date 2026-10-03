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
import type { StayItem } from "./api/stays";
import Navbar, { type NavTab } from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Stays from "./pages/Stays";
import Rides from "./pages/Rides";
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import Login, { type LoggedInUser } from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

const socket = io("http://localhost:5000", {
  autoConnect: true,
});

interface RideUpdatePayload {
  rideId: string;
  status: string;
  message: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("Home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [prefillRideDestination, setPrefillRideDestination] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [rides, setRides] = useState<RideItem[]>([]);
  const [availableRides, setAvailableRides] = useState<RideItem[]>([]);
  const [driverRides, setDriverRides] = useState<RideItem[]>([]);
  const [rideError, setRideError] = useState("");
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [rideUpdate, setRideUpdate] = useState<RideUpdatePayload | null>(null);

  const loadRidesData = useCallback(async () => {
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

  // Real-time socket room management
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
      loadRidesData();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("welcome", handleWelcome);
    socket.on("ride-update", handleRideUpdate);

    loadRidesData();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("welcome", handleWelcome);
      socket.off("ride-update", handleRideUpdate);
    };
  }, [currentUser, loadRidesData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setRides([]);
    setAvailableRides([]);
    setDriverRides([]);
    setRideUpdate(null);
    setActiveTab("Home");
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      await acceptRide(rideId);
      await loadRidesData();
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
      await loadRidesData();
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
      await loadRidesData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to cancel ride");
    }
  };

  // Stay + Ride connection trigger
  const handleRideToStay = (stay: StayItem) => {
    setPrefillRideDestination(`${stay.title}, ${stay.city}`);
    setActiveTab("Rides");
  };

  // Preview booking trigger
  const handleBookStay = (stay: StayItem) => {
    alert(
      `🎉 You selected "${stay.title}" (₹${stay.pricePerNight}/night) in ${stay.city}!\n\nFull Booking & Payment workflow will be integrated in Phase 3. You can also coordinate a ride directly to this stay!`
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthMode("login");
          setShowAuthModal(true);
        }}
        socketConnected={socketConnected}
      />

      {/* Main Content Pages */}
      <main style={{ flex: 1 }}>
        {activeTab === "Home" && (
          <Home
            onNavigate={(tab) => setActiveTab(tab)}
            onRideToStay={handleRideToStay}
            onBookStay={handleBookStay}
          />
        )}

        {activeTab === "Explore" && (
          <Explore
            onSelectDestination={() => {
              setActiveTab("Home");
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "Stays" && (
          <Stays
            onRideToStay={handleRideToStay}
            onBookStay={handleBookStay}
          />
        )}

        {activeTab === "Rides" && (
          <Rides
            currentUser={currentUser}
            rides={rides}
            availableRides={availableRides}
            driverRides={driverRides}
            rideError={rideError}
            rideUpdate={rideUpdate}
            onAcceptRide={handleAcceptRide}
            onUpdateStatus={handleUpdateStatus}
            onCancelRide={handleCancelRide}
            onRideCreated={loadRidesData}
            onOpenAuth={() => {
              setAuthMode("login");
              setShowAuthModal(true);
            }}
            prefillDestination={prefillRideDestination}
            onClearPrefill={() => setPrefillRideDestination("")}
          />
        )}

        {activeTab === "Trips" && (
          <Trips
            onNavigate={(tab) => setActiveTab(tab)}
            onSearchStayInDestination={() => {
              setActiveTab("Home");
            }}
          />
        )}

        {activeTab === "Profile" && (
          <Profile
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAuth={() => {
              setAuthMode("login");
              setShowAuthModal(true);
            }}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
            }}
            socketConnected={socketConnected}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavClick={(tab) => setActiveTab(tab)} />

      {/* Auth Modal Backdrop */}
      {showAuthModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
        >
          <div style={{ position: "relative", width: "100%", maxWidth: "460px" }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {authMode === "login" ? (
              <Login
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  setShowAuthModal(false);
                }}
                onSwitchToRegister={() => setAuthMode("register")}
              />
            ) : (
              <Register
                onSwitchToLogin={() => setAuthMode("login")}
                onRegisteredSuccess={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
