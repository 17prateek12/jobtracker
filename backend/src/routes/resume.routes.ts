import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { uploadResume } from "../middlewares/upload.middleware";
import {
    uploadResumeController,
    createBuiltResumeController,
    getResumesController,
    getResumeVersionsController,
    getResumeByIdController,
    deleteResumeController,
    convertResumeController,
} from "../controllers/resume.controller";

const router = Router();

// Protect all resume endpoints with JWT verification
router.use(protect);

router.post("/upload", uploadResume, uploadResumeController);
router.post("/built", createBuiltResumeController);
router.post("/:id/convert", convertResumeController);
router.get("/", getResumesController);
router.get("/versions", getResumeVersionsController);
router.get("/:id", getResumeByIdController);
router.delete("/:id", deleteResumeController);

export default router;
