import { Router } from "express";
import {
  createRideController,
  getAvailableRidesController,
  acceptRideController,
  updateRideStatusController,
  cancelRideController,
  getMyRidesController,
  getDriverRidesController,
  getRideByIdController,
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

router.get(
  "/my",
  authenticate,
  authorize("CUSTOMER"),
  getMyRidesController
);

router.get(
  "/driver",
  authenticate,
  authorize("DRIVER"),
  getDriverRidesController
);

router.get(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "DRIVER", "ADMIN"),
  getRideByIdController
);

export default router;