import { TemplateType } from "../types/types";

export interface CreateTemplateDto {
    name: string;
    type: TemplateType;
    subject?: string;
    content: string;
    isDefault?: boolean;
}

export interface UpdateTemplateDto {
    name?: string;
    subject?: string;
    content?: string;
    isDefault?: boolean;
}

export interface TemplateQueryDto {
    type?: TemplateType;
}