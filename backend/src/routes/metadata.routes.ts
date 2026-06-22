import { Router } from "express";
import { getEnums } from "../controllers/metadata.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();
router.use(protect);
router.get("/enums", getEnums);

export default router;
