import { Schema, model } from "mongoose";
import { JobLevel, JobRole, OpportunitySource, OpportunityStatus, RequiredSkills } from "../types/types";

const opportunitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    jobRole: {
      type: String,
      required: true,
      enum: Object.values(JobRole),
    },

    jobLevel:{
      type: String,
      required: true,
      enum: Object.values(JobLevel),
    },

    source: {
      type: String,
      enum: Object.values(OpportunitySource),
      default: OpportunitySource.MANUAL,
    },

    jobUrl: String,

    jobDescription: String,

    appliedAt: Date,

    requiredSkills: [
      {
        type: String,
        enum: Object.values(RequiredSkills),
      },
    ],

    notes: String,

    status: {
      type: String,
      enum: Object.values(OpportunityStatus),
      default: OpportunityStatus.SAVED,
    },

    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ userId: 1 });

opportunitySchema.index({
  userId: 1,
  status: 1,
});

opportunitySchema.index({
  userId: 1,
  companyId: 1,
});

export default model("Opportunity", opportunitySchema);