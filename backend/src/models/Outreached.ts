import { Schema, model } from "mongoose";
import { ContactRole, OutreachStatus, OutreachType } from "../types/types";

const outreachSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        opportunityId: {
            type: Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true,
        },

        type: {
            type: String,
            enum: Object.values(OutreachType),
            required: true,
        },

        contactName: {
            type: String,
            trim: true,
        },

        contactRole: {
            type: String,
            enum: Object.values(ContactRole),
        },

        linkedinUrl: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: Object.values(OutreachStatus),
            default: OutreachStatus.DRAFT,
        },

        message: {
            type: String,
            trim: true,
        },

        sentAt: Date,

        respondedAt: Date,

        lastInteractionAt: Date,

        nextFollowupAt: Date,

        followupCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default model("Outreach", outreachSchema);

outreachSchema.index({
  opportunityId: 1,
});

outreachSchema.index({
  status: 1,
});

outreachSchema.index({
  type: 1,
});