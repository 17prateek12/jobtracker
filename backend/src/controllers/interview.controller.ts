import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiError } from "../utils/ApiError";
import {
  createInterviewService,
  getInterviewsService,
  getInterviewByIdService,
  updateInterviewService,
  deleteInterviewService,
} from "../services/interview.service";

// 1. Create a scheduled interview
export const createInterviewController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { opportunityId, title, type, scheduledAt, durationMinutes, notes } = req.body;

    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    if (!opportunityId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Opportunity ID is required");
    }

    if (!title || !title.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Interview Title is required");
    }

    if (!type) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Interview Type is required");
    }

    if (!scheduledAt) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Scheduled Date/Time is required");
    }

    const interview = await createInterviewService(userId, {
      opportunityId,
      title,
      type,
      scheduledAt,
      durationMinutes,
      notes,
    });

    res.status(HTTP_STATUS.CREATED).json(
      new APIResponse("Interview scheduled successfully", interview)
    );
  }
);

// 2. Get all interviews for user
export const getInterviewsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    const interviews = await getInterviewsService(userId);

    res.status(HTTP_STATUS.OK).json(
      new APIResponse("Interviews retrieved successfully", interviews)
    );
  }
);

// 3. Get single interview by ID
export const getInterviewByIdController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    const interview = await getInterviewByIdService(userId, id);

    res.status(HTTP_STATUS.OK).json(
      new APIResponse("Interview retrieved successfully", interview)
    );
  }
);

// 4. Update interview details/feedback
export const updateInterviewController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;
    const payload = req.body;

    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    const updated = await updateInterviewService(userId, id, payload);

    res.status(HTTP_STATUS.OK).json(
      new APIResponse("Interview updated successfully", updated)
    );
  }
);

// 5. Delete an interview
export const deleteInterviewController = asyncHandler(
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    await deleteInterviewService(userId, id);

    res.status(HTTP_STATUS.OK).json(
      new APIResponse("Interview deleted successfully")
    );
  }
);
