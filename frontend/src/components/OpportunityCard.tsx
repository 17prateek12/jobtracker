import type { Opportunity } from "../types/opportunity";
import type { MouseEvent } from "react";

interface OpportunityCardProps {
    job: Opportunity;
    onNavigate: (id: string) => void;
    onDelete: (e: MouseEvent, id: string, role: string) => void;
}

export default function OpportunityCard({ job, onNavigate, onDelete }: OpportunityCardProps) {
    const formatEnum = (str: string) => {
        if (!str) return "";
        return str.split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
    };

    const formattedRole = formatEnum(job.jobRole);
    const company = job.companyId as any;
    const companyName = company?.name || "";

    return (
        <div 
            className="opportunity-card" 
            onClick={() => onNavigate(job._id)}
        >
            <div className="opportunity-card-left">
                <h4 className="opportunity-card-title">
                    {formattedRole}
                    {companyName && (
                        <span style={{ fontWeight: "normal", fontSize: "14px", color: "var(--text)", marginLeft: "8px" }}>
                            at {companyName}
                        </span>
                    )}
                </h4>
                <div className="opportunity-card-meta">
                    <span>Level: {formatEnum(job.jobLevel)}</span>
                    {job.source && <span>Source: {formatEnum(job.source)}</span>}
                    {job.appliedAt && (
                        <span>
                            Applied: {new Date(job.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    )}
                </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`status-badge ${job.status?.toLowerCase() || 'saved'}`}>
                    {job.status || "SAVED"}
                </span>
                <button 
                    className="btn-icon" 
                    onClick={(e) => onDelete(e, job._id, formattedRole)}
                    style={{ color: "#ef4444", padding: "6px" }}
                    title="Delete Opportunity"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
