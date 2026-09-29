import { Router } from "express";

import {
  createReviewController,
  getReviewsForStayController,
  getReviewStatsForStayController,
} from "../controllers/review.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/stay/:stayId/stats",
  getReviewStatsForStayController
);

router.get(
  "/stay/:stayId",
  getReviewsForStayController
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createReviewController
);

export default router;