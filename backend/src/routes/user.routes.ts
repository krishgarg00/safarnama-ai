import { Router } from "express";

import {
  getUsers,
  registerUser,
  getCurrentUser,
  testHostAccess,
} from "../controllers/user.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, getUsers);

router.get("/me", authenticate, getCurrentUser);

router.post("/", registerUser);

router.get(
  "/host-test",
  authenticate,
  authorize("HOST"),
  testHostAccess
);

export default router;