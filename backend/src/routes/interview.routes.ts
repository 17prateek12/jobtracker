import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createInterviewController,
  getInterviewsController,
  getInterviewByIdController,
  updateInterviewController,
  deleteInterviewController,
} from "../controllers/interview.controller";

const router = Router();

// Protect all routes
router.use(protect);

router.post("/", createInterviewController);
router.get("/", getInterviewsController);
router.get("/:id", getInterviewByIdController);
router.put("/:id", updateInterviewController);
router.delete("/:id", deleteInterviewController);

export default router;
