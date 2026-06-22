import api from "./api";
import type { Opportunity } from "../types/opportunity";

export const getOpportunity =
    async (
        id: string
    ) => {

        const response =
            await api.get(
                `/api/opportunities/${id}`
            );

        return response.data.data;
    };

export const updateOpportunity =
    async (
        id: string,
        data: any
    ) => {

        const response =
            await api.patch(
                `/api/opportunities/${id}`,
                data
            );

        return response.data.data;
    };

export const deleteOpportunity =
    async (
        id: string
    ) => {

        const response =
            await api.delete(
                `/api/opportunities/${id}`
            );

        return response.data.data;
    };

export const createOpportunity =
    async (
        data: any
    ) => {

        const response =
            await api.post(
                "/api/opportunities",
                data
            );

        return response.data.data;
    };

export interface GetOpportunitiesResponse {
    items: Opportunity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const getOpportunities = async (params: { 
    companyId?: string; 
    search?: string; 
    status?: string; 
    jobLevel?: string; 
    page?: number; 
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    startDate?: string;
    endDate?: string;
}): Promise<GetOpportunitiesResponse> => {
    const query = new URLSearchParams();
    if (params.companyId) query.append("companyId", params.companyId);
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.jobLevel) query.append("jobLevel", params.jobLevel);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);

    const response = await api.get(`/api/opportunities?${query.toString()}`);
    return response.data.data;
};