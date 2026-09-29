import { Router } from "express";
import {
  createRideController,
  getAvailableRidesController,
  acceptRideController,
  updateRideStatusController,
  cancelRideController,
} from "../controllers/ride.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createRideController
);

router.get(
  "/available",
  authenticate,
  authorize("DRIVER"),
  getAvailableRidesController
);

router.patch(
  "/:id/accept",
  authenticate,
  authorize("DRIVER"),
  acceptRideController
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("DRIVER"),
  updateRideStatusController
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("CUSTOMER", "DRIVER"),
  cancelRideController
);

export default router;