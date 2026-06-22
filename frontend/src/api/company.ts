import api from "./api";

export const getCompanies =
    async () => {

        const response =
            await api.get(
                "/api/capture/captured-jobs"
            );

        return response.data.data;
    };

export const getCompanyJobs =
    async (
        companyId: string
    ) => {

        const response =
            await api.get(
                `/api/capture/captured-jobs/${companyId}`
            );

        return response.data.data;
    };