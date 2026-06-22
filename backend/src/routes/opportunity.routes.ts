import { Router } from "express";
import {
    createOpportunity,
    getOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity,
} from "../controllers/opportunity.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../validators/validate.middleware";
import { createOpportunitySchema, updateOpportunitySchema } from "../validators/opportunity.validator";

const router = Router();
router.use(protect);
router.post("/", validate(createOpportunitySchema), createOpportunity);
router.get("/", getOpportunities);
router.get("/:id", getOpportunityById);
router.patch("/:id", validate(updateOpportunitySchema), updateOpportunity);
router.delete("/:id", deleteOpportunity);

export default router;