import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/database";

import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import notificationRoutes from "./routes/notification.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import rideRoutes from "./routes/ride.routes";
import stayRoutes from "./routes/stay.routes";
import userRoutes from "./routes/user.routes";
import aiRoutes from "./routes/ai.routes";

import { initializeSocket } from "./socket";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  },
});

initializeSocket(io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.emit("welcome", {
    message: "Welcome to Travel Nexus real-time server 🚀",
  });

  socket.on("join-user-room", (userId: string) => {
    socket.join(`user:${userId}`);

    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Travel Nexus API is running 🚀",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

const startServer = async (): Promise<void> => {
  httpServer.listen(PORT, () => {
    console.log(
      `Travel Nexus backend running on http://localhost:${PORT}`
    );
  });

  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB connection deferred. Server running with active endpoints and fallbacks.");
  }
};

startServer();