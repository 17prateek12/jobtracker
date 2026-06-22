import { ICompany } from "../models/Company";

export interface CreateCompanyDto {
    name: string;
    website?: string;
    linkedinUrl?: string;
}

export interface CreateCompanyResult {
  company: ICompany;
  isNew: boolean;
}

export interface UpdateCompanyDto {
  name?: string;
  website?: string;
  linkedinUrl?: string;
}

export interface CompanyQueryDto {
  search?: string;
  page?: string;
  limit?: string;
}

