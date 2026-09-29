import { Router } from "express";

import {
  createBookingController,
  getMyBookingsController,
  getHostBookingsController,
  updateBookingStatusController,
  cancelBookingController,
} from "../controllers/booking.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get("/my", authenticate, authorize("CUSTOMER"), getMyBookingsController);

router.get("/host", authenticate, authorize("HOST"), getHostBookingsController);

router.post("/", authenticate, authorize("CUSTOMER"), createBookingController);

router.patch(
  "/:id/status",
  authenticate,
  authorize("HOST"),
  updateBookingStatusController,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("CUSTOMER", "HOST"),
  cancelBookingController
);

export default router;
