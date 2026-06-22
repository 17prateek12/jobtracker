import api from "./api";

export interface BackendEnums {
    opportunityStatuses: string[];
    opportunitySources: string[];
    jobLevels: string[];
    jobRoles: string[];
    contactRoles: string[];
    outreachTypes: string[];
    outreachStatuses: string[];
    requiredSkills: string[];
}

export const getBackendEnums = async (): Promise<BackendEnums> => {
    const response = await api.get("/api/metadata/enums");
    return response.data.data;
};
