export interface CreateFollowupDto {
    outreachId: string;
    message?: string;
    notes?: string;
    sentAt?: Date;
}

export interface UpdateFollowupDto {
    message?: string;
    notes?: string;
}