import api from "./api";

export interface IResumeAnalysis {
    score: number;
    missingSkills: string[];
    suggestions: string[];
    tailoredSummary: string;
}

export interface ITailorOutreachResponse {
    tailoredMessage: string;
}

export const analyzeResume = async (resumeId: string, jobDescription: string): Promise<IResumeAnalysis> => {
    const response = await api.post("/api/ai/analyze-resume", {
        resumeId,
        jobDescription,
    });
    return response.data.data;
};

export const tailorOutreach = async (
    templateContent: string,
    jobDescription: string,
    resumeId?: string
): Promise<ITailorOutreachResponse> => {
    const response = await api.post("/api/ai/tailor-outreach", {
        templateContent,
        jobDescription,
        resumeId,
    });
    return response.data.data;
};

export const improveText = async (text: string, context?: string): Promise<string> => {
    const response = await api.post("/api/ai/improve", {
        text,
        context,
    });
    return response.data.data.improved;
};
