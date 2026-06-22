import api from "./api";

export interface IInterview {
  _id: string;
  userId: string;
  opportunityId: {
    _id: string;
    jobRole: string;
    jobLevel: string;
    companyId: {
      _id: string;
      name: string;
      website?: string;
      linkedinUrl?: string;
    };
  };
  title: string;
  type: "SCREENING" | "TECHNICAL" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "HR" | "OTHER";
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getInterviews = async (): Promise<IInterview[]> => {
  const response = await api.get("/api/interviews");
  return response.data.data;
};

export const getInterviewById = async (id: string): Promise<IInterview> => {
  const response = await api.get(`/api/interviews/${id}`);
  return response.data.data;
};

export const createInterview = async (payload: {
  opportunityId: string;
  title: string;
  type: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}): Promise<IInterview> => {
  const response = await api.post("/api/interviews", payload);
  return response.data.data;
};

export const updateInterview = async (
  id: string,
  payload: Partial<IInterview>
): Promise<IInterview> => {
  const response = await api.put(`/api/interviews/${id}`, payload);
  return response.data.data;
};

export const deleteInterview = async (id: string): Promise<void> => {
  await api.delete(`/api/interviews/${id}`);
};
