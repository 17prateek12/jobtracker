import type { Company } from "../types/company";
import type { MouseEvent } from "react";

interface CompanyCardProps {
    company: Company;
    onNavigate: (id: string) => void;
    onEdit: (e: MouseEvent, company: Company) => void;
    onDelete: (e: MouseEvent, id: string, name: string) => void;
}

export default function CompanyCard({ company, onNavigate, onEdit, onDelete }: CompanyCardProps) {
    return (
        <div 
            className="company-card"
            onClick={() => onNavigate(company._id)}
        >
            <div className="company-card-header">
                <h3 className="company-card-title" title={company.name}>
                    {company.name}
                </h3>
                <div className="company-card-actions">
                    <button 
                        className="btn-icon" 
                        onClick={(e) => onEdit(e, company)}
                        title="Edit Company"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                        </svg>
                    </button>
                    <button 
                        className="btn-icon" 
                        onClick={(e) => onDelete(e, company._id, company.name)}
                        style={{ color: "#ef4444" }}
                        title="Delete Company"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </button>
                </div>
            </div>

            {company.totalJobs !== undefined && (
                <span className="company-jobs-badge">
                    {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
                </span>
            )}

            <div className="company-card-links">
                {company.website ? (
                    <a 
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        Website
                    </a>
                ) : (
                    <span className="company-link" style={{ opacity: 0.4, cursor: "default" }}>No Website</span>
                )}

                {company.linkedinUrl ? (
                    <a 
                        href={company.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                    </a>
                ) : (
                    <span className="company-link" style={{ opacity: 0.4, cursor: "default" }}>No LinkedIn</span>
                )}
            </div>
        </div>
    );
}
