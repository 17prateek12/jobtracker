import Outreached from "../models/Outreached";
import { ApiError } from "../utils/ApiError";
import Followup from "../models/Followup";
import { CreateFollowupDto, } from "../dtos/followup.dto";
import { validateObjectId } from "../utils/validateObjectId";
import { HTTP_STATUS } from "../constants/httpStatus";


export const createFollowupService = async (userId: string, payload: CreateFollowupDto) => {
    validateObjectId(payload.outreachId, "Outreached");
    const outreach = await Outreached.findOne({ _id: payload.outreachId, userId, });

    if (!outreach) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Outreach not found"
        );
    }

    const followup = await Followup.create({
        userId,
        outreachId: payload.outreachId,
        message: payload.message,
        sentAt: payload.sentAt ?? Date.now(),
        notes: payload.notes,
    });

    outreach.followupCount += 1;
    outreach.lastInteractionAt = new Date();
    outreach.nextFollowupAt = undefined;
    (outreach as any).notified3Day = false;
    (outreach as any).notified7Day = false;
    await outreach.save();
    return followup;
};

export const getFollowupsService = async (userId: string, outreachId: string) => {
    validateObjectId(outreachId, "Outreached");
    const outreach = await Outreached.findOne({ _id: outreachId, userId, });

    if (!outreach) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Outreach not found"
        );
    }

    const followups = await Followup.find({ outreachId, userId, })
        .sort({ createdAt: -1, });

    return followups;
};

export const deleteFollowupService = async (userId: string, followupId: string): Promise<void> => {
    validateObjectId(followupId, "Followup");

    const followup = await Followup.findOneAndDelete({ _id: followupId, userId, });

    if (!followup) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Followup not found"
        );
    }

    await Outreached.findByIdAndUpdate(
        followup.outreachId,
        {
            $inc: {
                followupCount: -1,
            },
        }
    );
};