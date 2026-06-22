import { Schema, model } from "mongoose";

const resumeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        version: {
            type: Number,
            default: 1,
        },
        s3Key: {
            type: String,
        },
        s3Url: {
            type: String,
        },
        structuredData: {
            summary: String,
            experience: [
                {
                    company: String,
                    role: String,
                    duration: String,
                    description: String,
                },
            ],
            projects: [
                {
                    title: String,
                    description: String,
                    techStack: [String],
                    liveLink: String,
                    githubLink: String,
                },
            ],
            skills: [String],
            education: [
                {
                    school: String,
                    degree: String,
                    year: String,
                },
            ],
            certifications: [String],
        },
        type: {
            type: String,
            enum: ["UPLOADED", "BUILT"],
            required: true,
        },
        isLatest: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index to quickly query resumes by user and retrieve versions sequentially
resumeSchema.index({ userId: 1, name: 1, version: -1 });

export default model("Resume", resumeSchema);
