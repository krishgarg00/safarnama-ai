import { Router } from "express";
import { createStayController } from "../controllers/stay.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("HOST"),
  createStayController
);

export default router;