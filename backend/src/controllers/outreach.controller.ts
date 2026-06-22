import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import {
    createOutreachService,
    getOutreachsService,
    getOutreachByIdService,
    updateOutreachService,
    deleteOutreachService
} from "../services/outreach.service";
import { checkFollowupReminders } from "../services/notification.service";
import { CreateOutreachDto, UpdateOutreachDto, OutreachQueryDto } from "../dtos/outreach.dto";
import { HTTP_STATUS } from "../constants/httpStatus";

export const createOutreach =
    asyncHandler(async (req: Request<{}, {}, CreateOutreachDto>, res: Response): Promise<void> => {
        const outreach = await createOutreachService(req.user!.id, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new APIResponse(
                "Outreach created successfully",
                outreach
            )
        );
    });

export const getOutreachs =
    asyncHandler(async (req: Request<{}, {}, {}, OutreachQueryDto>, res: Response): Promise<void> => {
        const outreachs = await getOutreachsService(req.user!.id, req.query);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Outreachs fetched successfully",
                outreachs
            )
        );
    });

export const getOutreachById =
    asyncHandler(async (req: Request<{ id: string; }>, res: Response): Promise<void> => {

        const outreach = await getOutreachByIdService(req.user!.id, req.params.id);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Outreach fetched successfully",
                outreach
            )
        );
    });


export const updateOutreach =
    asyncHandler(async (req: Request<{ id: string }, {}, UpdateOutreachDto>, res: Response): Promise<void> => {

        const outreach = await updateOutreachService(req.user!.id, req.params.id, req.body);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Outreach updated successfully",
                outreach
            )
        );
    });

export const deleteOutreach =
    asyncHandler(async (req: Request<{ id: string; }>, res: Response): Promise<void> => {

        await deleteOutreachService(req.user!.id, req.params.id);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Outreach deleted successfully"
            )
        );
    });

export const triggerNotificationCheck =
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const count = await checkFollowupReminders();
        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                `Manual followup reminders check complete. Sent ${count} email notifications.`,
                { sentCount: count }
            )
        );
    });