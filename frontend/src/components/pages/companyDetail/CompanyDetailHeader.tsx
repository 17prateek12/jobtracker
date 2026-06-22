import type { Company } from "../../../types/company";

interface CompanyDetailHeaderProps {
    company: Company;
    onBack: () => void;
    onAddOpportunity: () => void;
}

export default function CompanyDetailHeader({ company, onBack, onAddOpportunity }: CompanyDetailHeaderProps) {
    return (
        <div className="company-details-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h2 className="company-details-title">{company.name}</h2>
                    <div className="company-details-meta">
                        {company.website ? (
                            <a 
                                href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="company-link"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {company.website}
                            </a>
                        ) : (
                            <span className="company-link" style={{ opacity: 0.5, cursor: "default" }}>No Website added</span>
                        )}

                        {company.linkedinUrl ? (
                            <a 
                                href={company.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="company-link"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                                LinkedIn Profile
                            </a>
                        ) : (
                            <span className="company-link" style={{ opacity: 0.5, cursor: "default" }}>No LinkedIn added</span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-secondary" onClick={onBack}>
                        Back to Companies
                    </button>
                    <button className="btn btn-primary" onClick={onAddOpportunity}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Opportunity
                    </button>
                </div>
            </div>
        </div>
    );
}
