import { useState } from "react";
import type { FormEvent } from "react";
import type { BackendEnums } from "../../../api/metadata";

interface OpportunityFormProps {
    enums: BackendEnums;
    onSubmit: (payload: any) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
}

export default function OpportunityForm({ enums, onSubmit, onCancel, submitting }: OpportunityFormProps) {
    const [jobRole, setJobRole] = useState(enums.jobRoles[0] || "");
    const [jobLevel, setJobLevel] = useState(enums.jobLevels[0] || "");
    const [status, setStatus] = useState(enums.opportunityStatuses[0] || "SAVED");
    const [source, setSource] = useState(enums.opportunitySources[0] || "MANUAL");
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [formError, setFormError] = useState("");

    const formatEnum = (str: string) => {
        if (!str) return "";
        return str.split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
    };

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!jobRole || !jobLevel || !status) {
            setFormError("Job Role, Level, and Status are required.");
            return;
        }

        try {
            setFormError("");
            await onSubmit({
                jobRole,
                jobLevel,
                status,
                source,
                jobUrl: jobUrl.trim() || undefined,
                jobDescription: jobDescription.trim() || undefined,
                notes: notes.trim() || undefined,
                requiredSkills: selectedSkills,
            });
        } catch (error: any) {
            setFormError(error?.response?.data?.message || "Failed to submit opportunity");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {formError && (
                <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px", textAlign: "left" }}>
                    {formError}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                    <label className="form-label">Job Role *</label>
                    <select 
                        className="form-select"
                        value={jobRole} 
                        onChange={(e) => setJobRole(e.target.value)}
                        required
                    >
                        {enums.jobRoles.map(role => (
                            <option key={role} value={role}>{formatEnum(role)}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Job Level *</label>
                    <select 
                        className="form-select"
                        value={jobLevel} 
                        onChange={(e) => setJobLevel(e.target.value)}
                        required
                    >
                        {enums.jobLevels.map(level => (
                            <option key={level} value={level}>{formatEnum(level)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select 
                        className="form-select"
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        {enums.opportunityStatuses.map(stat => (
                            <option key={stat} value={stat}>{stat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Source</label>
                    <select 
                        className="form-select"
                        value={source} 
                        onChange={(e) => setSource(e.target.value)}
                    >
                        {enums.opportunitySources.map(src => (
                            <option key={src} value={src}>{formatEnum(src)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Job Posting URL</label>
                <input
                    type="url"
                    className="form-input"
                    placeholder="https://company.com/careers/job-id"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                    className="form-textarea"
                    placeholder="Paste the job description or details here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Personal Notes</label>
                <textarea
                    className="form-textarea"
                    placeholder="Add any reminders, plans, or observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Required Skills</label>
                <div className="skills-selector">
                    <div className="skills-checkbox-grid">
                        {enums.requiredSkills.map(skill => (
                            <label key={skill} className="skill-checkbox-label">
                                <input 
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill)}
                                    onChange={() => toggleSkill(skill)}
                                />
                                {formatEnum(skill)}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Opportunity"}
                </button>
            </div>
        </form>
    );
}
