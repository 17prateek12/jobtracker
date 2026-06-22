import api from "./api";

export interface ITemplate {
    _id: string;
    name: string;
    type: "REFERRAL" | "COLD_EMAIL" | "FOLLOWUP" | "LINKEDIN_DM";
    subject?: string;
    content: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const getTemplates = async (): Promise<ITemplate[]> => {
    const response = await api.get("/api/templates");
    return response.data.data;
};

export const createTemplate = async (payload: Partial<ITemplate>): Promise<ITemplate> => {
    const response = await api.post("/api/templates", payload);
    return response.data.data;
};

export const updateTemplate = async (id: string, payload: Partial<ITemplate>): Promise<ITemplate> => {
    const response = await api.patch(`/api/templates/${id}`, payload);
    return response.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
    await api.delete(`/api/templates/${id}`);
};
