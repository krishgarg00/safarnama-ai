import { Router } from "express";
import {
  getUsers,
  registerUser,
  getCurrentUser,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getUsers);
router.get("/me", authenticate, getCurrentUser);
router.post("/", registerUser);

export default router;