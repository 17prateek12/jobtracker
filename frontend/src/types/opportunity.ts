export interface CompanyPopulated {
    _id: string;
    name: string;
    website?: string;
    linkedinUrl?: string;
}

export interface Opportunity {
    _id: string;
    companyId: CompanyPopulated | string;
    jobRole: string;
    jobLevel: string;
    status: string;
    source: string;
    jobUrl: string;
    jobDescription?: string;
    requiredSkills?: string[];
    notes?: string;
    appliedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Outreach {
    _id: string;
    opportunityId: string;
    type: string;
    contactName?: string;
    contactRole?: string;
    linkedinUrl?: string;
    email?: string;
    phone?: string;
    notes?: string;
    status: string;
    message?: string;
    sentAt?: string;
    respondedAt?: string;
    lastInteractionAt?: string;
    nextFollowupAt?: string;
    followupCount: number;
}

export interface Followup {
    _id: string;
    outreachId: string;
    message?: string;
    sentAt?: string;
    notes?: string;
    createdAt?: string;
}