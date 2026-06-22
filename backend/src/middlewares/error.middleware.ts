import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { success } from "zod";
import { HTTP_STATUS } from "../constants/httpStatus";

export const errorMiddleWare = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    console.error(err);


    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
    });
};