import { Router } from "express";
import { createFollowup, getFollowups, deleteFollowup } from "../controllers/followup.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../validators/validate.middleware";
import { createFollowupSchema } from "../validators/followup.validator";

const router = Router();
router.use(protect);
router.post("/", validate(createFollowupSchema), createFollowup);
router.get("/outreach/:outreachId", getFollowups);
router.delete("/:id", deleteFollowup);
export default router;