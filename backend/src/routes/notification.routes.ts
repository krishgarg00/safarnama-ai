import { Router } from "express";

import {
  createNotificationController,
  getMyNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/my",
  authenticate,
  authorize("CUSTOMER", "HOST", "DRIVER", "ADMIN"),
  getMyNotificationsController
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER", "HOST", "DRIVER", "ADMIN"),
  createNotificationController
);

router.patch(
  "/:id/read",
  authenticate,
  authorize("CUSTOMER", "HOST", "DRIVER", "ADMIN"),
  markNotificationAsReadController
);

export default router;