import { ContactRole, OutreachStatus, OutreachType } from "../types/types";

export interface CreateOutreachDto {
    opportunityId: string;
    type: OutreachType;
    contactName?: string;
    contactRole?: ContactRole;
    linkedinUrl?: string;
    email?: string;
    phone?: string;
    message?: string;
    notes?: string;
    status?: OutreachStatus;
    sentAt?: Date;
    nextFollowupAt?: Date;
}

export interface UpdateOutreachDto {
    type?: OutreachType;
    contactName?: string;
    contactRole?: ContactRole;
    linkedinUrl?: string;
    email?: string;
    phone?: string;
    message?: string;
    response?: string;
    notes?: string;
    status?: OutreachStatus;
    sentAt?: Date;
    lastInteractionAt?: Date;
    nextFollowupAt?: Date;
    isSuccessful?: boolean;
}

export interface OutreachQueryDto {
    opportunityId?: string;
    status?: OutreachStatus;
    type?: OutreachType;
    page?: string;
    limit?: string;
}