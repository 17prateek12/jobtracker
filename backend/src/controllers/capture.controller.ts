import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { APIResponse } from "../utils/ApiResponse";
import { CreateCaptureOpportunityService, getCapturedJobsService, getCompanyJobsService } from "../services/capture.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import { CapturedJobsQueryDto, CreateCaptureJobDto, CompanyJobsParamsDto } from "../dtos/capture.dto";

export const captureJobController =
    asyncHandler(async (req: Request<{}, {}, CreateCaptureJobDto>, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const opportunity =
            await CreateCaptureOpportunityService(
                userId,
                req.body
            );

        res.status(HTTP_STATUS.CREATED).json(
            new APIResponse(
                "Successfully Create Opportunity",
                opportunity
            )
        );
    });




export const getCapturedJobsController =
    asyncHandler(async (req: Request<{}, {}, {}, CapturedJobsQueryDto>, res: Response): Promise<void> => {

        const companies = await getCapturedJobsService(req.user.id, req.query);

        res.status(HTTP_STATUS.OK).json(
            new APIResponse(
                "Success",
                companies
            )
        );
    });

export const getCompanyJobsController =
    asyncHandler(async (req: Request<CompanyJobsParamsDto>,res: Response): Promise<void> => {
            const data =await getCompanyJobsService(req.user.id,req.params);

            res.status(HTTP_STATUS.OK).json(
                    new APIResponse(
                        "Success",
                        data
                    )
                );
        }
    );    