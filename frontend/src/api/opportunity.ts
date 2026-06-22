import api from "./api";

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