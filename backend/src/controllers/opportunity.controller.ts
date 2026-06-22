import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
    createOpportunityService,
    getOpportunitiesService,
    getOpportunityByIdService,
    updateOpportunityService,
    deleteOpportunityService,
} from "../services/opportunity.service";
import {
    CreateOpportunityDto,
    UpdateOpportunityDto,
    OpportunityQueryDto,
} from "../dtos/opportunity.dto";
import { APIResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../constants/httpStatus";

export const createOpportunity =
    asyncHandler(async (req: Request<{}, {}, CreateOpportunityDto>, res: Response): Promise<void> => {
        const opportunity = await createOpportunityService(req.user!.id, req.body);

        res.status(HTTP_STATUS.CREATED).json(
            new APIResponse(
                "Opportunity created successfully",
                opportunity
            )
        );
    }
    );

export const getOpportunities =
    asyncHandler(async (req: Request<{}, {}, {}, OpportunityQueryDto>, res: Response): Promise<void> => {
        const opportunities = await getOpportunitiesService(req.user!.id, req.query);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Opportunities fetched successfully",
                opportunities
            )
        );
    });

export const getOpportunityById =
    asyncHandler(async (req: Request<{ id: string; }>, res: Response): Promise<void> => {
        const opportunity = await getOpportunityByIdService(req.user!.id, req.params.id);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Opportunity fetched successfully",
                opportunity
            )
        );
    });

export const updateOpportunity =
    asyncHandler(async (req: Request<{ id: string }, {}, UpdateOpportunityDto>, res: Response): Promise<void> => {

        const opportunity = await updateOpportunityService(req.user!.id, req.params.id, req.body);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Opportunity updated successfully",
                opportunity
            )
        );
    });

export const deleteOpportunity =
    asyncHandler(async (req: Request<{ id: string; }>, res: Response): Promise<void> => {
        await deleteOpportunityService(req.user!.id, req.params.id);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Opportunity deleted successfully"
            )
        );
    });