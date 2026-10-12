import { Router } from "express";
import {
  planTripController,
  summarizeReviewsController,
  chatController,
} from "../controllers/ai.controller";

const router = Router();

router.post("/plan-trip", planTripController);
router.post("/summarize-reviews", summarizeReviewsController);
router.post("/chat", chatController);

export default router;
