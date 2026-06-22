import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { loginWithGoogleService, devLoginService } from "../services/auth.service";
import { GoogleLoginDto, DevLoginDto } from "../dtos/auth.dto";
import { HTTP_STATUS } from "../constants/httpStatus";

export const googleLogin =
    asyncHandler(async (req: Request<{}, {}, GoogleLoginDto>, res: Response): Promise<void> => {
        const result = await loginWithGoogleService(req.body.idToken);
        res.status(HTTP_STATUS.OK).json(
            new APIResponse("Login Successful", result)
        );
    });

export const getCurrentUser =
    asyncHandler(async (req, res): Promise<void> => {
        res.status(HTTP_STATUS.OK).json(
            new APIResponse("User fetched successfully", req.user)
        );
    });

export const devLogin = 
asyncHandler(async (req: Request<{},{},DevLoginDto>,res: Response): Promise<void> => {
        const result = await devLoginService(req.body);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Login successful",
                result
            )
        );
    }
);    