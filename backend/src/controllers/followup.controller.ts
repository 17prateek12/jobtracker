import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { createFollowupService, deleteFollowupService, getFollowupsService } from "../services/followup.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import { CreateFollowupDto } from "../dtos/followup.dto";

export const createFollowup =
    asyncHandler(async (req: Request<{}, {}, CreateFollowupDto>, res: Response): Promise<void> => {
        const followup = await createFollowupService(req.user!.id, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new APIResponse(
                "Followup created successfully",
                followup
            )
        );
    });

export const getFollowups =
    asyncHandler(async (req: Request<{ outreachId: string; }>, res: Response): Promise<void> => {
        const followups = await getFollowupsService(req.user!.id, req.params.outreachId);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Followups fetched successfully",
                followups
            )
        );
    });

export const deleteFollowup =
    asyncHandler(async (req: Request<{ id: string; }>, res: Response): Promise<void> => {

        await deleteFollowupService(req.user!.id, req.params.id);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Followup deleted successfully"
            )
        );
    });