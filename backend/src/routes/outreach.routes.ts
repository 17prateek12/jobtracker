import { Router } from "express";
import { createOutreach, getOutreachs, getOutreachById, updateOutreach, deleteOutreach, triggerNotificationCheck } from "../controllers/outreach.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../validators/validate.middleware";
import { createOutreachSchema, updateOutreachSchema, } from "../validators/outreach.validator";

const router = Router();

router.use(protect);

router.post("/", validate(createOutreachSchema), createOutreach);
router.get("/notifications/check", triggerNotificationCheck);
router.get("/", getOutreachs);
router.get("/:id", getOutreachById);
router.patch("/:id", validate(updateOutreachSchema), updateOutreach);
router.delete("/:id", deleteOutreach);

export default router;