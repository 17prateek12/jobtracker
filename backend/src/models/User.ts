import { Schema, model } from "mongoose";

export interface IUser {
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);