import { Router } from "express";
import {
  createStayController,
  getStays,
} from "../controllers/stay.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Public: anyone can browse stays
router.get("/", getStays);

// Protected: only HOST/ADMIN can create a stay
router.post(
  "/",
  authenticate,
  authorize("HOST", "ADMIN"),
  createStayController
);

export default router;