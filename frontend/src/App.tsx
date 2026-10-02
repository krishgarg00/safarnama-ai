import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface RideUpdate {
  rideId: string;
  status: string;
  message: string;
}

function App() {
  const [rideUpdate, setRideUpdate] = useState<RideUpdate | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      setConnected(true);

      socket.emit("join-user-room", "6abb78bdcf61e6340dcb52c8");
    });

    socket.on("welcome", (data) => {
      console.log("Real-time message:", data.message);
    });

    socket.on("ride-update", (data: RideUpdate) => {
      console.log("🚗 Ride update:", data);

      setRideUpdate(data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");

      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("welcome");
      socket.off("ride-update");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div>
      <h1>Safarnama AI</h1>

      <p>
        Socket.IO: {connected ? "Connected 🟢" : "Disconnected 🔴"}
      </p>

      {rideUpdate && (
        <div>
          <h2>🚗 Ride Update</h2>

          <p>
            <strong>Status:</strong> {rideUpdate.status}
          </p>

          <p>{rideUpdate.message}</p>

          <p>
            <strong>Ride ID:</strong> {rideUpdate.rideId}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;