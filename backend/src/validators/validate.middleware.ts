import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodType } from "zod";
import { HTTP_STATUS } from "../constants/httpStatus";

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Body : ",req.body)
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        result.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    req.body = result.data;
    next();
  };