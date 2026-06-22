import { Router } from "express";
import { getCurrentUser, googleLogin, devLogin } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import {validate} from "../validators/validate.middleware";
import { googleLoginSchema, devLoginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/google-login",validate(googleLoginSchema), googleLogin);
router.get("/me", protect, getCurrentUser);
router.get("/dev-login", validate(devLoginSchema), devLogin)
export default router;