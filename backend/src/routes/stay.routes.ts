import { Router } from "express";
import {
  createStayController,
  getStays,
  getStay,
  updateStayController,
  deleteStayController,
} from "../controllers/stay.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Public: anyone can browse stays
router.get("/", getStays);

// Public: get one stay
router.get("/:id", getStay);

// Protected: only HOST/ADMIN can create a stay
router.post(
  "/",
  authenticate,
  authorize("HOST", "ADMIN"),
  createStayController
);

router.put(
  "/:id",
  authenticate,
  authorize("HOST", "ADMIN"),
  updateStayController
);

router.delete(
  "/:id",
  authenticate,
  authorize("HOST", "ADMIN"),
  deleteStayController
);

export default router;