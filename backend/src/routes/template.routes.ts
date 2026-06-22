import { Router } from "express";
import {createTemplate,getTemplates,getTemplateById,updateTemplate,deleteTemplate,} from "../controllers/template.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../validators/validate.middleware";

import { createTemplateSchema, updateTemplateSchema } from "../validators/template.validator";

const router = Router();

router.use(protect);
router.post("/", validate(createTemplateSchema), createTemplate);
router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.patch("/:id", validate(updateTemplateSchema), updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;