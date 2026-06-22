import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { 
    OpportunityStatus, 
    OpportunitySource, 
    JobLevel, 
    JobRole, 
    ContactRole, 
    OutreachType, 
    OutreachStatus,
    RequiredSkills 
} from "../types/types";
import { APIResponse } from "../utils/ApiResponse";
import { HTTP_STATUS } from "../constants/httpStatus";

export const getEnums = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.status(HTTP_STATUS.OK).json(
        new APIResponse("Enums fetched successfully", {
            opportunityStatuses: Object.values(OpportunityStatus),
            opportunitySources: Object.values(OpportunitySource),
            jobLevels: Object.values(JobLevel),
            jobRoles: Object.values(JobRole),
            contactRoles: Object.values(ContactRole),
            outreachTypes: Object.values(OutreachType),
            outreachStatuses: Object.values(OutreachStatus),
            requiredSkills: Object.values(RequiredSkills),
        })
    );
});
