import mongoose, { Schema, model, Document } from "mongoose";

export interface ICompany{
    userId:  mongoose.Types.ObjectId;
    name: string;
    normalizedName: string;
    website?: string;
    linkedinUrl?: string;
}

const companySchema = new Schema(
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

    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index(
  {
    userId: 1,
    normalizedName: 1,
  },
  {
    unique: true,
  }
);

export default model("Company", companySchema);