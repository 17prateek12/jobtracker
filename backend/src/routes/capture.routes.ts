import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {captureJobController,getCapturedJobsController,getCompanyJobsController,} from "../controllers/capture.controller";

const router = Router();
router.use(protect);
router.post("/capture-job", captureJobController);
router.get("/captured-jobs",getCapturedJobsController);
router.get("/captured-jobs/:companyId",getCompanyJobsController);

export default router;