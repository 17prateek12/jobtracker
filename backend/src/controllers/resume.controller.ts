import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiError } from "../utils/ApiError";
import {
    uploadResumeService,
    createBuiltResumeService,
    getResumesService,
    getResumeVersionsService,
    getResumeByIdService,
    deleteResumeService,
    convertUploadedResumeService,
} from "../services/resume.service";

// 1. Upload Resume file version (handles multipart upload)
export const uploadResumeController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { name } = req.body;
    const file = req.file;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized access");
    }

    if (!name || !name.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Resume Name is required");
    }

    if (!file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No file uploaded");
    }

    const resume = await uploadResumeService({
        userId,
        name: name.trim(),
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
    });

    res.status(HTTP_STATUS.CREATED).json(
        new APIResponse("Resume version uploaded successfully", resume)
    );
});

// 2. Save built/structured builder resume version
export const createBuiltResumeController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { name, structuredData } = req.body;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!name || !name.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Resume Name is required");
    }

    if (!structuredData) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Structured resume data is required");
    }

    const resume = await createBuiltResumeService({
        userId,
        name: name.trim(),
        structuredData,
    });

    res.status(HTTP_STATUS.CREATED).json(
        new APIResponse("Structured resume saved successfully", resume)
    );
});

// 3. Get all latest resumes
export const getResumesController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const showOnlyLatest = req.query.all !== "true";

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    const resumes = await getResumesService(userId, showOnlyLatest);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Resumes fetched successfully", resumes)
    );
});

// 4. Get all versions for a distinct resume base name
export const getResumeVersionsController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { name } = req.query;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!name || typeof name !== "string") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Resume base name query parameter is required");
    }

    const versions = await getResumeVersionsService(userId, name);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Resume versions fetched successfully", versions)
    );
});

// 5. Get single resume by ID
export const getResumeByIdController = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    const resume = await getResumeByIdService(userId, id);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Resume fetched successfully", resume)
    );
});

// 6. Delete a specific resume version
export const deleteResumeController = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    await deleteResumeService(userId, id);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Resume deleted successfully")
    );
});

// 7. Convert uploaded S3 resume to built structured resume using Gemini
export const convertResumeController = asyncHandler(async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    const convertedResume = await convertUploadedResumeService(userId, id);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Uploaded resume converted successfully", convertedResume)
    );
});
