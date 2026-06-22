import Interview from "../models/Interview";
import Opportunity from "../models/Opportunity";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId";
import { HTTP_STATUS } from "../constants/httpStatus";
import { OpportunityStatus } from "../types/types";

export const createInterviewService = async (
  userId: string,
  payload: {
    opportunityId: string;
    title: string;
    type: string;
    scheduledAt: string | Date;
    durationMinutes?: number;
    notes?: string;
  }
) => {
  validateObjectId(payload.opportunityId, "Opportunity");

  const opportunity = await Opportunity.findOne({ _id: payload.opportunityId, userId });
  if (!opportunity) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Associated Opportunity not found");
  }

  // Create the interview
  const interview = await Interview.create({
    userId,
    opportunityId: payload.opportunityId,
    title: payload.title.trim(),
    type: payload.type as any,
    scheduledAt: new Date(payload.scheduledAt),
    durationMinutes: payload.durationMinutes ?? 45,
    status: "SCHEDULED" as any,
    notes: payload.notes?.trim() ?? "",
  });

  // Promote opportunity status to INTERVIEW automatically if it is not already set
  if (opportunity.status !== OpportunityStatus.INTERVIEW) {
    opportunity.status = OpportunityStatus.INTERVIEW;
    await opportunity.save();
  }

  return interview;
};

export const getInterviewsService = async (userId: string) => {
  return await Interview.find({ userId })
    .populate({
      path: "opportunityId",
      populate: {
        path: "companyId",
        select: "name website linkedinUrl",
      },
    })
    .sort({ scheduledAt: 1 });
};

export const getInterviewByIdService = async (userId: string, id: string) => {
  validateObjectId(id, "Interview");
  const interview = await Interview.findOne({ _id: id, userId }).populate({
    path: "opportunityId",
    populate: {
      path: "companyId",
      select: "name website linkedinUrl",
    },
  });

  if (!interview) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Interview not found");
  }

  return interview;
};

export const updateInterviewService = async (
  userId: string,
  id: string,
  payload: {
    title?: string;
    type?: string;
    scheduledAt?: string | Date;
    durationMinutes?: number;
    status?: string;
    notes?: string;
    feedback?: string;
  }
) => {
  validateObjectId(id, "Interview");
  const interview = await Interview.findOne({ _id: id, userId });
  if (!interview) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Interview not found");
  }

  if (payload.title !== undefined) interview.title = payload.title.trim();
  if (payload.type !== undefined) interview.type = payload.type as any;
  if (payload.scheduledAt !== undefined) interview.scheduledAt = new Date(payload.scheduledAt);
  if (payload.durationMinutes !== undefined) interview.durationMinutes = payload.durationMinutes;
  if (payload.status !== undefined) interview.status = payload.status as any;
  if (payload.notes !== undefined) interview.notes = payload.notes.trim();
  if (payload.feedback !== undefined) interview.feedback = payload.feedback.trim();

  await interview.save();

  // Return full populated updated document
  return await getInterviewByIdService(userId, id);
};

export const deleteInterviewService = async (userId: string, id: string) => {
  validateObjectId(id, "Interview");
  const interview = await Interview.findOne({ _id: id, userId });
  if (!interview) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Interview not found");
  }

  await Interview.deleteOne({ _id: id });
};
