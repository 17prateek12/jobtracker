export interface Opportunity {
    _id: string;
    companyId: string;
    jobRole: string;
    jobLevel: string;
    status: string;
    source: string;
    jobUrl: string;
    requiredSkills?: string[];
}