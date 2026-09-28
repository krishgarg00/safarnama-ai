import { Router } from "express";
import {
  getUsers,
  registerUser,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getUsers);
router.post("/", registerUser);

export default router;