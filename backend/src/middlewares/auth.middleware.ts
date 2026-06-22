import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { HTTP_STATUS } from "../constants/httpStatus";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    req.user = payload;
    next();
};