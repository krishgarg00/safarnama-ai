import { Router } from "express";

import {
  createPaymentController,
  updatePaymentStatusController,
  getPaymentByIdController,
  getMyPaymentsController,
} from "../controllers/payment.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createPaymentController
);

router.get(
  "/my",
  authenticate,
  authorize("CUSTOMER"),
  getMyPaymentsController
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("CUSTOMER"),
  updatePaymentStatusController
);

router.get(
  "/:id",
  authenticate,
  authorize("CUSTOMER"),
  getPaymentByIdController
);

export default router;