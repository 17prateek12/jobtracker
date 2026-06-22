import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import {
    createTemplateService,
    getTemplatesService,
    getTemplateByIdService,
    updateTemplateService,
    deleteTemplateService,
} from "../services/template.service";
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, } from "../dtos/template.dto";
import { HTTP_STATUS } from "../constants/httpStatus";

export const createTemplate =
    asyncHandler(async (req: Request<{}, {}, CreateTemplateDto>, res: Response): Promise<void> => {
        const template = await createTemplateService(req.user!.id, req.body);

        res.status(HTTP_STATUS.CREATED).json(
            new APIResponse(
                "Template created successfully",
                template
            )
        );
    });

export const getTemplates =
    asyncHandler(async (req: Request<{}, {}, {}, TemplateQueryDto>, res: Response): Promise<void> => {
        const templates = await getTemplatesService(req.user!.id, req.query);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Templates fetched successfully",
                templates
            )
        );
    });

export const getTemplateById =
    asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        const template = await getTemplateByIdService(req.user!.id, req.params.id);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Template fetched successfully",
                template
            )
        );
    });

export const updateTemplate =
    asyncHandler(async (req: Request<{ id: string }, {}, UpdateTemplateDto>, res: Response): Promise<void> => {

        const template = await updateTemplateService(req.user!.id, req.params.id, req.body);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Template updated successfully",
                template
            )
        );
    });

export const deleteTemplate =
    asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {

        await deleteTemplateService(req.user!.id, req.params.id);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Template deleted successfully"
            )
        );
    });