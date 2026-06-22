import { Router } from "express";
import { createCompany, updateCompany, getCompanies, getCompanyById, deleteCompany } from "../controllers/company.controller";
import { validate } from "../validators/validate.middleware";
import { createCompanySchema, updateCompanySchema } from "../validators/company.validator";
import { protect } from "../middlewares/auth.middleware";

const router = Router();
router.use(protect);
router.post("/", validate(createCompanySchema), createCompany);
router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.patch("/:id", validate(updateCompanySchema), updateCompany);
router.delete("/:id", deleteCompany);

export default router;