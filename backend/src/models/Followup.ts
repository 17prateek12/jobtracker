import { Schema, model } from "mongoose";

const followupSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        outreachId: {
            type: Schema.Types.ObjectId,
            ref: "Outreach",
            required: true,
        },

        message: {
            type: String,
            trim: true,
        },

        sentAt: {
            type: Date,
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

followupSchema.index({
    outreachId: 1,
});

export default model(
    "Followup",
    followupSchema
);