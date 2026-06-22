import api from "./api";

export const getFollowups = async (outreachId: string) => {
    const response = await api.get(`/api/followups/outreach/${outreachId}`);
    return response.data.data;
};

export const createFollowup = async (data: any) => {
    const response = await api.post("/api/followups", data);
    return response.data.data;
};

export const deleteFollowup = async (id: string) => {
    const response = await api.delete(`/api/followups/${id}`);
    return response.data.data;
};
