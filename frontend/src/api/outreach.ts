import api from "./api";

export const getOutreaches = async (opportunityId: string) => {
    const response = await api.get("/api/outreaches", {
        params: { opportunityId }
    });
    return response.data.data;
};

export const createOutreach = async (data: any) => {
    const response = await api.post("/api/outreaches", data);
    return response.data.data;
};

export const updateOutreach = async (id: string, data: any) => {
    const response = await api.patch(`/api/outreaches/${id}`, data);
    return response.data.data;
};

export const deleteOutreach = async (id: string) => {
    const response = await api.delete(`/api/outreaches/${id}`);
    return response.data.data;
};
