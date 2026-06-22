import Company from "../models/Company";
import { CompanyQueryDto, CreateCompanyDto, CreateCompanyResult, UpdateCompanyDto } from "../dtos/company.dto";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";
import { validateObjectId } from "../utils/validateObjectId";

export const createCompanyService = async (userId: string, payload: CreateCompanyDto): Promise<CreateCompanyResult> => {
    const normalizedName = payload.name.trim().toLowerCase();

    const existingCompany = await Company.findOne({ userId, normalizedName });
    if (existingCompany) {
        return {
            company: existingCompany,
            isNew: false
        };
    }

    const company = await Company.create({
        userId,
        name: payload.name.trim(),
        normalizedName,
        website: payload.website,
        linkedinUrl: payload.linkedinUrl,
    });

    return {
        company,
        isNew: true,
    }
};

export const updateCompanyService = async (userId: string, companyId: string, payload: UpdateCompanyDto) => {

    validateObjectId(companyId, "Company")

    const company = await Company.findOne({
        _id: companyId,
        userId,
    });

    if (!company) {
        throw new ApiError(
            404, "Company not found"
        );
    }

    if (payload.name) {
        const normalizedName = payload.name.trim().toLowerCase();

        const existingComany = await Company.findOne({
            userId,
            normalizedName,
            _id: {
                $ne: companyId
            },
        });

        if (existingComany) {
            throw new ApiError(HTTP_STATUS.CONFLICT, "Company already exists");
        }

        company.name = payload.name.trim();
        company.normalizedName = normalizedName;
    }

    if (payload.website !== undefined) {
        company.website = payload.website;
    }

    if (payload.linkedinUrl !== undefined) {
        company.linkedinUrl = payload.linkedinUrl;
    }

    await company.save();
    return company;
};

export const getCompaniesService = async (userId: string, query: CompanyQueryDto) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search?.trim();

    const filter: any = {
        userId,
    };

    if (search) {
        filter.name = {
            $regex: search,
            $option: "i",
        };
    }

    const [items, total] = await Promise.all([
        Company.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

        Company.countDocuments(filter),
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const deleteCompanyService = async (userId: string, companyId: string): Promise<void> => {
    const company = await Company.findOneAndDelete({
        _id: companyId,
        userId,
    });

    if (!company) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Company not found"
        );
    }
};

export const getCompanyByIdService = async (userId: string, companyId: string) => {
    validateObjectId(companyId, "Company");

    const company = await Company.findOne({
        _id: companyId,
        userId,
    });

    if (!company) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Company not found"
        );
    }

    return company;

}