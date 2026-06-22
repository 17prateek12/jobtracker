import Opportunity from "../models/Opportunity";
import Company from "../models/Company";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId";
import { CreateOpportunityDto, OpportunityQueryDto, UpdateOpportunityDto } from "../dtos/opportunity.dto";
import { HTTP_STATUS } from "../constants/httpStatus";
import { OpportunityStatus } from "../types/types";

export const createOpportunityService = async (userId: string, payload: CreateOpportunityDto) => {
    validateObjectId(payload.companyId, "Company");
    const company = await Company.findOne({ _id: payload.companyId, userId });

    if (!company) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Company not found");
    }

    const appliedAt = payload.status === OpportunityStatus.APPLIED ? new Date() : undefined;

    const opportunity = await Opportunity.create({
        userId,
        companyId: payload.companyId,
        jobRole: payload.jobRole,
        jobLevel: payload.jobLevel,
        source: payload.source,
        jobUrl: payload.jobUrl,
        jobDescription: payload.jobDescription,
        requiredSkills: payload.requiredSkills ?? [],
        notes: payload.notes,
        status: payload.status,
        appliedAt: payload.appliedAt ?? appliedAt,
        resumeId: payload.resumeId,
    });

    return opportunity;
};

export const getOpportunitiesService = async (userId: string, query: OpportunityQueryDto) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const filter: any = { userId };

    if (query.status) {
        filter.status = query.status;
    }

    if (query.companyId) {
        filter.companyId = query.companyId;
    }

    if (query.search) {
        filter.jobRole = {
            $regex: query.search,
            $options: "i",
        };
    }

    if (query.jobRole) {
        filter.jobRole = query.jobRole;
    }

    if (query.jobLevel) {
        filter.jobLevel = query.jobLevel;
    }

    // Applied date range filter
    if (query.startDate || query.endDate) {
        filter.appliedAt = {};
        if (query.startDate) {
            filter.appliedAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            filter.appliedAt.$lte = new Date(query.endDate);
        }
    }

    // Sorting
    const sortField = query.sortBy || "createdAt";
    const sortDir = query.sortOrder === "asc" ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortDir;

    const [items, total] = await Promise.all([
        Opportunity.find(filter)
            .populate("companyId", "name website linkedinUrl")
            .populate("resumeId", "name version s3Url type")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit),

        Opportunity.countDocuments(filter),
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getOpportunityByIdService = async (userId: string, opportunityId: string) => {
    validateObjectId(opportunityId, "Opportunity");

    const opportunity = await Opportunity.findOne({ _id: opportunityId, userId, })
        .populate("companyId", "name website linkedinUrl")
        .populate("resumeId", "name version s3Url type");

    if (!opportunity) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Opportunity not found"
        );
    }
    return opportunity;
};

export const updateOpportunityService = async (userId: string, opportunityId: string, payload: UpdateOpportunityDto) => {
    validateObjectId(opportunityId, "Opportunity");

    const opportunity = await Opportunity.findOne({ _id: opportunityId, userId, });

    if (!opportunity) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Opportunity not found"
        );
    }

    if (payload.jobRole) {
        opportunity.jobRole = payload.jobRole;
    }

    if (payload.jobLevel) {
        opportunity.jobLevel = payload.jobLevel;
    }

    if (payload.source) {
        opportunity.source = payload.source;
    }

    if (payload.jobUrl !== undefined) {
        opportunity.jobUrl = payload.jobUrl;
    }

    if (payload.jobDescription !== undefined) {
        opportunity.jobDescription = payload.jobDescription;
    }

    if (payload.requiredSkills !== undefined) {
        opportunity.requiredSkills = payload.requiredSkills;
    }

    if (payload.notes !== undefined) {
        opportunity.notes = payload.notes;
    }

    if (payload.appliedAt) {
        opportunity.appliedAt = payload.appliedAt;
    }

    if (payload.status) {

        if (opportunity.status !== OpportunityStatus.APPLIED && payload.status === OpportunityStatus.APPLIED && !opportunity.appliedAt) {
            opportunity.appliedAt = new Date();
        }
        opportunity.status = payload.status;
    }

    if (payload.resumeId !== undefined) {
        opportunity.resumeId = payload.resumeId ? new Types.ObjectId(payload.resumeId) : undefined;
    }

    await opportunity.save();
    return opportunity;
};

export const deleteOpportunityService = async (userId: string, opportunityId: string): Promise<void> => {
    validateObjectId(opportunityId, "Opportunity");
    const opportunity = await Opportunity.findOneAndDelete({ _id: opportunityId, userId, });

    if (!opportunity) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Opportunity not found"
        );
    }
};