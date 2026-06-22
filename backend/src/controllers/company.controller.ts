import { Request, Response } from "express";
import { APIResponse } from "../utils/ApiResponse";
import asyncHandler from "express-async-handler";
import { HTTP_STATUS } from "../constants/httpStatus";
import { CompanyQueryDto, CreateCompanyDto, UpdateCompanyDto } from "../dtos/company.dto";
import { createCompanyService, deleteCompanyService, getCompaniesService, getCompanyByIdService, updateCompanyService } from "../services/company.service";


export const createCompany =
    asyncHandler(async (req: Request<{}, {}, CreateCompanyDto>, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const result = await createCompanyService(userId, req.body);
        if (result.isNew) {
            res.status(HTTP_STATUS.CREATED).json(
                new APIResponse(
                    "Company created successfully", result.company
                )
            );
            return;
        }
        res.status(HTTP_STATUS.CONFLICT).json(
            new APIResponse(
                "Company already existed",
                result.company
            )
        );
    });

export const updateCompany =
    asyncHandler(async (req: Request<{ id: string }, {}, UpdateCompanyDto>, res: Response): Promise<void> => {
        const company = await updateCompanyService(req.user!.id, req.params.id, req.body);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Company update successfully",
                company
            )
        );
    });

export const getCompanies =
    asyncHandler(async (req: Request<{}, {}, {}, CompanyQueryDto>, res: Response): Promise<void> => {
        const result = await getCompaniesService(req.user!.id, req.query);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Companies fetched successfully",
                result
            )
        );
    }
    );

export const deleteCompany =
    asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        await deleteCompanyService(req.user!.id, req.params.id);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Company delete Successfully"
            )
        );
    });

export const getCompanyById =
    asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const company = await getCompanyByIdService(req.user!.id, req.params.id);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Company fetched successfully",
                company
            )
        );
    });