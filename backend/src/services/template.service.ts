import { HTTP_STATUS } from "../constants/httpStatus";
import { CreateTemplateDto, TemplateQueryDto, UpdateTemplateDto } from "../dtos/template.dto";
import Template from "../models/Template";
import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId";


export const createTemplateService = async (userId: string, payload: CreateTemplateDto) => {
    if (payload.isDefault) {
        await Template.updateMany(
            {
                userId,
                type: payload.type,
                isDefault: true,
            },
            {
                isDefault: false,
            }
        );
    }

    const template = await Template.create({
        userId,
        name: payload.name.trim(),
        type: payload.type,
        subject: payload.subject,
        content: payload.content,
        isDefault: payload.isDefault ?? false,
    });

    return template;
};

export const getTemplatesService = async (userId: string, query: TemplateQueryDto) => {

    const filter: any = { userId, };

    if (query.type) {
        filter.type = query.type;
    }

    const templates = await Template.find(filter)
        .sort({
            isDefault: -1,
            createdAt: -1,
        });

    return templates;
};

export const getTemplateByIdService = async (userId: string, templateId: string) => {
    validateObjectId(templateId, "Template");

    const template = await Template.findOne({ _id: templateId, userId, });

    if (!template) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Template not found"
        );
    }
    return template;
};

export const updateTemplateService = async (userId: string, templateId: string, payload: UpdateTemplateDto) => {
    validateObjectId(templateId, "Template");

    const template =
        await Template.findOne({
            _id: templateId,
            userId,
        });

    if (!template) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Template not found"
        );
    }

    if (payload.isDefault) {
        await Template.updateMany(
            {
                userId,
                type: template.type,
                isDefault: true,
            },
            {
                isDefault: false,
            }
        );
    }

    Object.assign(template, payload);
    await template.save();
    return template;
};

export const deleteTemplateService = async (userId: string, templateId: string): Promise<void> => {
    validateObjectId(templateId, "Template");

    const template = await Template.findOneAndDelete({ _id: templateId, userId, });
    if (!template) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "Template not found"
        );
    }
};