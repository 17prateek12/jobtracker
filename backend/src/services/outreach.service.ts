import { CreateOutreachDto, UpdateOutreachDto, OutreachQueryDto } from "../dtos/outreach.dto";
import { validateObjectId } from "../utils/validateObjectId";
import Opportunity from "../models/Opportunity";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";
import Outreached from "../models/Outreached";
import { OutreachStatus, OutreachType } from "../types/types";

export const createOutreachService = async (userId: string, payload: CreateOutreachDto) => {
    validateObjectId(payload.opportunityId, "Opportunity");

    const opportunity = await Opportunity.findOne({ _id: payload.opportunityId, userId, });

    if (!opportunity) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Opportunity not found"
        );
    }

    const outreach = await Outreached.create({
        userId,
        opportunityId: payload.opportunityId,
        type: payload.type,
        contactName: payload.contactName,
        contactRole: payload.contactRole,
        linkedinUrl: payload.linkedinUrl,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        notes: payload.notes,
        status: payload.status ?? OutreachStatus.DRAFT,
        sentAt: payload.sentAt ?? (payload.status === OutreachStatus.SENT ? new Date() : undefined),
        nextFollowupAt: payload.nextFollowupAt,
    });

    return outreach;
};

export const getOutreachsService = async (userId: string, query: OutreachQueryDto) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const filter: any = { userId, };

    if (query.opportunityId) {
        filter.opportunityId = query.opportunityId;
    }

    if (query.status) {
        filter.status = query.status;
    }

    if (query.type) {
        filter.type = query.type;
    }

    const [items, total] =
        await Promise.all([
            Outreached.find(filter)
                .populate("opportunityId", "jobRole status")
                .sort({ createdAt: -1, })
                .skip((page - 1) * limit)
                .limit(limit),

            Outreached.countDocuments(filter),]);

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

export const getOutreachByIdService = async (userId: string, outreachId: string) => {
    validateObjectId(outreachId, "Outreached");

    const outreach = await Outreached.findOne({ _id: outreachId, userId, })
        .populate("opportunityId", "jobRole status");

    if (!outreach) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Outreach not found"
        );
    }
    return outreach;
};

export const updateOutreachService = async (userId: string, outreachId: string, payload: UpdateOutreachDto) => {
    validateObjectId(outreachId, "Outreached");

    const outreach = await Outreached.findOne({ _id: outreachId, userId, });

    if (!outreach) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Outreach not found"
        );
    }

    Object.assign(outreach, payload);

    if(payload.sentAt){
        outreach.sentAt = payload.sentAt;
    }

    if (outreach.status !== OutreachStatus.SENT && payload.status === OutreachStatus.SENT && !outreach.sentAt) {
        outreach.sentAt = new Date();
    }

    if (payload.response) {
        outreach.respondedAt = new Date();
        outreach.lastInteractionAt = new Date();
        if (outreach.status !== OutreachStatus.REPLIED) {
            outreach.status = OutreachStatus.REPLIED;
        }
    }

    await outreach.save();
    return outreach;
};


export const deleteOutreachService = async (userId: string, outreachId: string): Promise<void> => {
    validateObjectId(outreachId, "Outreached");

    const outreach = await Outreached.findOneAndDelete({ _id: outreachId, userId, });

    if (!outreach) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Outreach not found"
        );
    }
};    