import mongoose from "mongoose";
import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";

export const validateObjectId = (
  id: string,
  entityName = "Resource"
): void => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid ${entityName} id`
    );
  }
};