import { Schema, model } from "mongoose";
import { TemplateType } from "../types/types";

const templateSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: Object.values(
                TemplateType
            ),
            required: true,
        },

        subject: {
            type: String,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

templateSchema.index({
    userId: 1,
    type: 1,
});

export default model("Template", templateSchema);