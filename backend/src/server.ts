import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import stayRoutes from "./routes/stay.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import rideRoutes from "./routes/ride.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/rides", rideRoutes);

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Safarnama AI API is running 🚀",
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Safarnama AI backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();