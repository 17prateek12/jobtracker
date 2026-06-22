import Company from "../models/Company";
import Opportunity from "../models/Opportunity";
import { CapturedJobsQueryDto, CompanyJobsParamsDto, CreateCaptureJobDto } from "../dtos/capture.dto";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId";
import { HTTP_STATUS } from "../constants/httpStatus";

export const CreateCaptureOpportunityService = async (userId: string, payload: CreateCaptureJobDto) => {
    const normalizedName = payload.companyName.trim().toLowerCase();
    let company = await Company.findOne({ userId, normalizedName });
    if (!company) {
        company = await Company.create({
            userId,
            name: payload.companyName.trim(),
            normalizedName,
        });
    }

    const existingOpportunity = await Opportunity.findOne({
        userId,
        companyId: company._id,
        jobRole: payload.jobName,
        jobLevel: payload.jobLevel,
        jobUrl: payload.jobUrl,
    });

    if (existingOpportunity) {
        return existingOpportunity;
    }

    const opportunity =
        await Opportunity.create({
            userId,
            companyId: company._id,
            jobRole: payload.jobName,
            jobLevel: payload.jobLevel,
            jobUrl: payload.jobUrl,
            source: payload.source,
            status: payload.opportunityStatus,
            requiredSkills:
                payload.requiredSkills ?? [],
        });

    return opportunity;
}

export const getCapturedJobsService = async (userId: string, query: CapturedJobsQueryDto) => {
    const filter: any = {
        userId,
    };

    if (query.search) {
        filter.name = {
            $regex: query.search,
            $options: "i",
        };
    }

    const companies = await Company.find(filter)
        .select("name")
        .sort({ name: 1 });

    return companies;

};


export const getCompanyJobsService = async (userId: string, payload: CompanyJobsParamsDto) => {
    validateObjectId(payload.companyId, "Company");

    const company = await Company.findOne({ _id: payload.companyId, userId, });

    if (!company) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Company not found"
        );
    }

    const jobs = await Opportunity.find({ userId, companyId: payload.companyId, })
        .select("jobRole jobLevel status")
        .sort({ createdAt: -1, });

    return {
        company,
        jobs,
    };
};