import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("welcome", (data) => {
      console.log("Real-time message:", data.message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("welcome");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div>
      <h1>Safarnama AI</h1>
      <p>Socket.IO test</p>
    </div>
  );
}

export default App;