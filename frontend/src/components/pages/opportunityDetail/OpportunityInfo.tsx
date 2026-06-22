import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Opportunity } from "../../../types/opportunity";
import type { BackendEnums } from "../../../api/metadata";

interface OpportunityInfoProps {
    opportunity: Opportunity;
    enums: BackendEnums;
    onUpdate: (payload: any) => Promise<void>;
    onQuickStatusChange: (status: string) => Promise<void>;
}

export default function OpportunityInfo({ opportunity, enums, onUpdate, onQuickStatusChange }: OpportunityInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [skillSearchQuery, setSkillSearchQuery] = useState("");
    const [form, setForm] = useState({
        jobRole: "",
        jobLevel: "",
        source: "",
        jobUrl: "",
        jobDescription: "",
        requiredSkills: [] as string[],
        notes: "",
        status: "",
        appliedAt: "",
    });

    const normalizeSkills = (skills: string[], allowedSkills: string[]): string[] => {
        if (!skills || !allowedSkills) return [];
        return skills.map(skill => {
            const matched = allowedSkills.find(allowed => allowed.toLowerCase() === skill.toLowerCase());
            return matched || skill.toUpperCase();
        });
    };

    useEffect(() => {
        if (opportunity) {
            const allowed = enums?.requiredSkills || [];
            setForm({
                jobRole: opportunity.jobRole || "",
                jobLevel: opportunity.jobLevel || "",
                source: opportunity.source || "",
                jobUrl: opportunity.jobUrl || "",
                jobDescription: opportunity.jobDescription || "",
                requiredSkills: normalizeSkills(opportunity.requiredSkills || [], allowed),
                notes: opportunity.notes || "",
                status: opportunity.status || "",
                appliedAt: opportunity.appliedAt ? new Date(opportunity.appliedAt).toISOString().substring(0, 10) : "",
            });
        }
    }, [opportunity, isEditing, enums]);

    const formatEnum = (str: string) => {
        if (!str) return "";
        return str.split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
    };

    const toggleSkill = (skill: string) => {
        const skills = form.requiredSkills.includes(skill)
            ? form.requiredSkills.filter(s => s !== skill)
            : [...form.requiredSkills, skill];
        setForm(prev => ({ ...prev, requiredSkills: skills }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await onUpdate({
                ...form,
                appliedAt: form.appliedAt ? new Date(form.appliedAt).toISOString() : null,
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update opportunity details.");
        }
    };

    const filteredSkills = enums.requiredSkills.filter(skill =>
        skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
    );

    const getStatusBg = (status: string) => {
        switch (status) {
            case "SAVED": return "#eff6ff";
            case "CONTACTING": return "#fef3c7";
            case "APPLIED": return "#ecfdf5";
            case "INTERVIEW": return "#faf5ff";
            case "OFFER": return "#f0fdf4";
            case "REJECTED": return "#fef2f2";
            case "GHOSTED": return "#f3f4f6";
            default: return "#f9fafb";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SAVED": return "#2563eb";
            case "CONTACTING": return "#d97706";
            case "APPLIED": return "#059669";
            case "INTERVIEW": return "#7c3aed";
            case "OFFER": return "#16a34a";
            case "REJECTED": return "#dc2626";
            case "GHOSTED": return "#4b5563";
            default: return "#111827";
        }
    };

    return (
        <div style={styles.panel}>
            <div style={styles.panelHeader}>
                <h2>Opportunity Details</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                        Edit Details
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                        Cancel
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Job Role *</label>
                            <select
                                value={form.jobRole}
                                onChange={e => setForm({ ...form, jobRole: e.target.value })}
                                style={styles.select}
                                required
                            >
                                {enums.jobRoles.map(role => (
                                    <option key={role} value={role}>{formatEnum(role)}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Job Level *</label>
                            <select
                                value={form.jobLevel}
                                onChange={e => setForm({ ...form, jobLevel: e.target.value })}
                                style={styles.select}
                                required
                            >
                                {enums.jobLevels.map(level => (
                                    <option key={level} value={level}>{formatEnum(level)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Opportunity Source</label>
                            <select
                                value={form.source}
                                onChange={e => setForm({ ...form, source: e.target.value })}
                                style={styles.select}
                            >
                                {enums.opportunitySources.map(src => (
                                    <option key={src} value={src}>{formatEnum(src)}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Job Posting URL</label>
                            <input
                                type="url"
                                value={form.jobUrl}
                                onChange={e => setForm({ ...form, jobUrl: e.target.value })}
                                style={styles.input}
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Job Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                style={styles.select}
                            >
                                {enums.opportunityStatuses.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Applied Date</label>
                            <input
                                type="date"
                                value={form.appliedAt}
                                onChange={e => setForm({ ...form, appliedAt: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Job Description</label>
                        <textarea
                            value={form.jobDescription}
                            rows={4}
                            onChange={e => setForm({ ...form, jobDescription: e.target.value })}
                            style={styles.textarea}
                            placeholder="Key requirements, summary..."
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: "left" }}>
                        <label style={styles.label}>Required Skills</label>
                        <input
                            type="text"
                            placeholder="Filter skills..."
                            value={skillSearchQuery}
                            onChange={e => setSkillSearchQuery(e.target.value)}
                            style={{ ...styles.input, marginBottom: "8px" }}
                        />
                        <div style={styles.skillsSelector}>
                            <div style={styles.skillsCheckboxGrid}>
                                {filteredSkills.map(skill => (
                                    <label key={skill} style={styles.skillCheckboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={form.requiredSkills.includes(skill)}
                                            onChange={() => toggleSkill(skill)}
                                        />
                                        {formatEnum(skill)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Notes</label>
                        <textarea
                            value={form.notes}
                            rows={3}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            style={styles.textarea}
                            placeholder="Personal comments..."
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        Save Details
                    </button>
                </form>
            ) : (
                <div style={styles.detailsView}>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Job Role</span>
                        <span style={styles.detailValue}>{formatEnum(opportunity.jobRole)}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Job Level</span>
                        <span style={styles.detailValue}>{formatEnum(opportunity.jobLevel)}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Source</span>
                        <span style={styles.detailValue}>{formatEnum(opportunity.source) || "Manual Entry"}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Applied Date</span>
                        <span style={styles.detailValue}>
                            {opportunity.appliedAt ? new Date(opportunity.appliedAt).toLocaleDateString() : "Not applied yet"}
                        </span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Status</span>
                        <select
                            value={opportunity.status}
                            onChange={e => onQuickStatusChange(e.target.value)}
                            style={{
                                ...styles.statusSelect,
                                backgroundColor: getStatusBg(opportunity.status),
                                color: getStatusColor(opportunity.status),
                            }}
                        >
                            {enums.opportunityStatuses.map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.detailDivider} />

                    <div style={{ textAlign: "left" }}>
                        <span style={styles.detailLabel}>Job Posting URL</span>
                        {opportunity.jobUrl ? (
                            <a
                                href={opportunity.jobUrl.startsWith("http") ? opportunity.jobUrl : `https://${opportunity.jobUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ ...styles.link, display: "block", marginTop: "4px", wordBreak: "break-all" }}
                            >
                                {opportunity.jobUrl} &nearr;
                            </a>
                        ) : (
                            <span style={{ ...styles.noneText, display: "block", marginTop: "4px" }}>No URL added</span>
                        )}
                    </div>

                    <div style={styles.detailDivider} />

                    <div style={{ textAlign: "left" }}>
                        <span style={styles.detailLabel}>Required Skills</span>
                        {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 ? (
                            <div style={styles.skillsContainer}>
                                {opportunity.requiredSkills.map(skill => (
                                    <span key={skill} style={styles.skillBadge}>
                                        {formatEnum(skill)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span style={{ ...styles.noneText, display: "block", marginTop: "4px" }}>No skills specified</span>
                        )}
                    </div>

                    <div style={styles.detailDivider} />

                    <div style={{ textAlign: "left" }}>
                        <span style={styles.detailLabel}>Job Description</span>
                        {opportunity.jobDescription ? (
                            <p style={{ ...styles.preText, marginTop: "6px" }}>{opportunity.jobDescription}</p>
                        ) : (
                            <span style={{ ...styles.noneText, display: "block", marginTop: "4px" }}>No description provided</span>
                        )}
                    </div>

                    <div style={styles.detailDivider} />

                    <div style={{ textAlign: "left" }}>
                        <span style={styles.detailLabel}>Personal Notes</span>
                        {opportunity.notes ? (
                            <p style={{ ...styles.preText, marginTop: "6px" }}>{opportunity.notes}</p>
                        ) : (
                            <span style={{ ...styles.noneText, display: "block", marginTop: "4px" }}>No personal notes</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    panel: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "var(--shadow)",
    },
    panelHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "12px",
        marginBottom: "16px",
    },
    editBtn: {
        background: "none",
        border: "1px solid var(--accent-border)",
        color: "var(--accent)",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
    },
    cancelBtn: {
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--text)",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    formRow: {
        display: "flex",
        gap: "12px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    formGroupHalf: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "var(--text-h)",
        textAlign: "left",
    },
    input: {
        padding: "8px 12px",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "15px",
        width: "100%",
        boxSizing: "border-box",
    },
    select: {
        padding: "8px 12px",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "15px",
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    textarea: {
        padding: "8px 12px",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "15px",
        fontFamily: "var(--sans)",
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
    },
    submitBtn: {
        background: "var(--accent)",
        border: "none",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "bold",
        textAlign: "center",
    },
    detailsView: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    detailRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "15px",
    },
    detailLabel: {
        color: "var(--text)",
        fontWeight: 500,
    },
    detailValue: {
        color: "var(--text-h)",
        fontWeight: 500,
    },
    statusSelect: {
        border: "none",
        borderRadius: "20px",
        padding: "4px 12px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        outline: "none",
    },
    link: {
        color: "var(--accent)",
        textDecoration: "none",
    },
    detailDivider: {
        height: "1px",
        background: "var(--border)",
        margin: "16px 0 8px 0",
    },
    skillsContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "4px",
    },
    skillBadge: {
        background: "var(--code-bg)",
        color: "var(--text-h)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "3px 8px",
        fontSize: "13px",
        fontWeight: 500,
    },
    noneText: {
        color: "var(--text)",
        fontStyle: "italic",
        fontSize: "14px",
    },
    preText: {
        whiteSpace: "pre-wrap",
        margin: 0,
        background: "var(--code-bg)",
        padding: "12px",
        borderRadius: "6px",
        fontSize: "14px",
        color: "var(--text-h)",
        lineHeight: "1.4",
        border: "1px solid var(--border)",
    },
    skillsSelector: {
        border: "1px solid var(--border)",
        borderRadius: "6px",
        maxHeight: "150px",
        overflowY: "auto",
        padding: "10px",
        background: "var(--code-bg)",
    },
    skillsCheckboxGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "8px",
    },
    skillCheckboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "var(--text)",
        cursor: "pointer",
    },
};
