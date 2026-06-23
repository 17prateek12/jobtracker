import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { analyzeResumeController, tailorOutreachController, improveTextController, generateOrRewriteTemplateController } from "../controllers/ai.controller";

const router = Router();

// Protect all AI endpoints
router.use(protect);

router.post("/analyze-resume", analyzeResumeController);
router.post("/tailor-outreach", tailorOutreachController);
router.post("/improve", improveTextController);
router.post("/template", generateOrRewriteTemplateController);

export default router;
