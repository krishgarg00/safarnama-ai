import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import stayRoutes from "./routes/stay.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stays", stayRoutes);

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