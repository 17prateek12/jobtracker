import api from "./api";
import type { Company } from "../types/company";

export interface GetCompaniesResponse {
    items: Company[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const getCompanies = async (search?: string, page = 1, limit = 12): Promise<GetCompaniesResponse> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await api.get(`/api/companies?${params.toString()}`);
    return response.data.data;
};

export const getCompanyById = async (companyId: string): Promise<Company> => {
    const response = await api.get(`/api/companies/${companyId}`);
    return response.data.data;
};

export const createCompany = async (payload: { name: string; website?: string; linkedinUrl?: string }): Promise<Company> => {
    const response = await api.post("/api/companies", payload);
    return response.data.data;
};

export const updateCompany = async (companyId: string, payload: { name?: string; website?: string; linkedinUrl?: string }): Promise<Company> => {
    const response = await api.patch(`/api/companies/${companyId}`, payload);
    return response.data.data;
};

export const deleteCompany = async (companyId: string): Promise<void> => {
    await api.delete(`/api/companies/${companyId}`);
};

export const getCompanyJobs = async (companyId: string) => {
    const response = await api.get(`/api/capture/captured-jobs/${companyId}`);
    return response.data.data;
};