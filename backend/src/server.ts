import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
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
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../backend/.env") });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow any origin for maximum deployment flexibility (local, Vercel, Render, Railway, etc.)
      callback(null, true);
    },
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

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Travel Nexus Backend API",
    status: "online",
    message: "Travel Nexus Backend Server is running 🚀",
    healthCheck: "/api/health",
  });
});

app.get("/api/health", (req: Request, res: Response) => {
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

// Serve frontend build in production or when dist exists
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

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
