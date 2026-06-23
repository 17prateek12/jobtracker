import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiError } from "../utils/ApiError";
import { getResumeByIdService } from "../services/resume.service";
import { analyzeResumeAts, tailorOutreachMessage, improveText, generateOrRewriteTemplate } from "../services/ai.service";

// 1. Analyze built resume against job description for ATS match
export const analyzeResumeController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { resumeId, jobDescription } = req.body;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!resumeId) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Resume ID is required");
    }

    if (!jobDescription || !jobDescription.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Job Description is required");
    }

    // Fetch candidate resume
    const resume = await getResumeByIdService(userId, resumeId);
    if (resume.type !== "BUILT" || !resume.structuredData) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "ATS matching is only supported for resumes created using the built-in online resume builder."
        );
    }

    const analysis = await analyzeResumeAts(resume.structuredData, jobDescription.trim());

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("ATS Match analysis completed successfully", analysis)
    );
});

// 2. Tailor outreach template using skills and job description
export const tailorOutreachController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { templateContent, jobDescription, resumeId } = req.body;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!templateContent || !templateContent.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Template content is required");
    }

    if (!jobDescription || !jobDescription.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Job description is required");
    }

    let skills: string[] = [];
    if (resumeId) {
        const resume = await getResumeByIdService(userId, resumeId);
        if (resume.structuredData && Array.isArray(resume.structuredData.skills)) {
            skills = resume.structuredData.skills;
        }
    }

    const result = await tailorOutreachMessage(skills, templateContent.trim(), jobDescription.trim());

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Outreach message tailored successfully", result)
    );
});

// 3. Improve resume text block
export const improveTextController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { text, context } = req.body;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!text || !text.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Text to improve is required");
    }

    const improved = await improveText(text.trim(), context);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Text improved successfully", { improved })
    );
});

export const generateOrRewriteTemplateController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { instruction, templateContent } = req.body;

    if (!userId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    if (!instruction || !instruction.trim()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Instruction is required");
    }

    const content = await generateOrRewriteTemplate(instruction.trim(), templateContent);

    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Template processed successfully", { content })
    );
});
