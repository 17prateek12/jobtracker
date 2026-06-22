import api from "./api";

export interface IResume {
    _id: string;
    name: string;
    version: number;
    s3Url?: string;
    type: "UPLOADED" | "BUILT";
    structuredData?: any;
    isLatest: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const getResumes = async (all = false): Promise<IResume[]> => {
    const response = await api.get(`/api/resumes?all=${all}`);
    return response.data.data;
};

export const getResumeVersions = async (name: string): Promise<IResume[]> => {
    const response = await api.get(`/api/resumes/versions?name=${encodeURIComponent(name)}`);
    return response.data.data;
};

export const uploadResumeFile = async (name: string, file: File): Promise<IResume> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("resumeFile", file);

    const response = await api.post("/api/resumes/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data.data;
};

export const createBuiltResume = async (name: string, structuredData: any): Promise<IResume> => {
    const response = await api.post("/api/resumes/built", { name, structuredData });
    return response.data.data;
};

export const deleteResume = async (id: string): Promise<void> => {
    await api.delete(`/api/resumes/${id}`);
};
export const getResumeById = async (id: string): Promise<IResume> => {
    const response = await api.get(`/api/resumes/${id}`);
    return response.data.data;
};

export const convertResume = async (id: string): Promise<IResume> => {
    const response = await api.post(`/api/resumes/${id}/convert`);
    return response.data.data;
};
