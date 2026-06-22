import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { BackendEnums } from "../../../api/metadata";
import { getTemplates } from "../../../api/template";
import type { ITemplate } from "../../../api/template";
import { useAuthStore } from "../../../store/useAuthStore";
import { tailorOutreach } from "../../../api/ai";

interface OutreachFormProps {
    enums: BackendEnums;
    opportunity: any;
    onSubmit: (payload: any) => Promise<void>;
    onCancel: () => void;
}

export default function OutreachForm({ enums, opportunity, onSubmit, onCancel }: OutreachFormProps) {
    const [contactName, setContactName] = useState("");
    const [contactRole, setContactRole] = useState(enums.contactRoles[0] || "RECRUITER");
    const [type, setType] = useState(enums.outreachTypes[0] || "LINKEDIN_DM");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(enums.outreachStatuses[0] || "DRAFT");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [isTailoring, setIsTailoring] = useState(false);

    // AI comparison view states
    const [showComparison, setShowComparison] = useState(false);
    const [originalMessage, setOriginalMessage] = useState("");
    const [tailoredMessage, setTailoredMessage] = useState("");

    const handleAiTailor = async () => {
        if (!message.trim()) return;

        const jobDescription = opportunity?.jobDescription || "";
        if (!jobDescription.trim()) {
            alert("Please add a Job Description to the opportunity details before tailoring outreach with AI.");
            return;
        }

        setIsTailoring(true);
        try {
            const resumeId = typeof opportunity?.resumeId === "object" && opportunity.resumeId
                ? opportunity.resumeId._id
                : opportunity?.resumeId;

            const response = await tailorOutreach(message, jobDescription, resumeId);
            if (response?.tailoredMessage) {
                setOriginalMessage(message);
                setTailoredMessage(response.tailoredMessage);
                setShowComparison(true);
            }
        } catch (err: any) {
            console.error("Tailoring error:", err);
            alert(err?.response?.data?.message || "Failed to tailor message with AI.");
        } finally {
            setIsTailoring(false);
        }
    };

    useEffect(() => {
        getTemplates()
            .then((data) => setTemplates(data || []))
            .catch((err) => console.error("Error loading outreach templates:", err));
    }, []);

    const interpolate = (templateContent: string, currentContactName: string) => {
        let text = templateContent;
        const company = opportunity?.companyId?.name || "Company";
        const role = opportunity?.jobRole?.replace(/_/g, " ") || "Role";
        const jobUrl = opportunity?.jobUrl || "";
        const name = currentContactName || "Contact";
        const yourName = useAuthStore.getState().user?.name || "Your Name";

        text = text.replace(/\{\{company\}\}/gi, company);
        text = text.replace(/\{\{role\}\}/gi, role);
        text = text.replace(/\{\{name\}\}/gi, name);
        text = text.replace(/\{\{jobUrl\}\}/gi, jobUrl);
        text = text.replace(/\{\{yourName\}\}/gi, yourName);

        return text;
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const template = templates.find((t) => t._id === selectedId);
        if (template) {
            const interpolated = interpolate(template.content, contactName);
            setMessage(interpolated);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!contactName.trim()) {
            setFormError("Contact name is required");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");
            await onSubmit({
                contactName: contactName.trim(),
                contactRole,
                type,
                linkedinUrl: linkedinUrl.trim() || undefined,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                message: message.trim() || undefined,
                status,
            });
        } catch (error: any) {
            setFormError(error?.response?.data?.message || "Failed to add contact");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            {formError && (
                <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px", textAlign: "left" }}>
                    {formError}
                </div>
            )}
            <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input 
                    type="text" 
                    value={contactName} 
                    placeholder="e.g. John Doe"
                    onChange={e => setContactName(e.target.value)} 
                    style={styles.input}
                    required
                />
            </div>
            <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                    <label style={styles.label}>Contact Role</label>
                    <select 
                        value={contactRole} 
                        onChange={e => setContactRole(e.target.value)}
                        style={styles.select}
                    >
                        {enums.contactRoles.map(role => (
                            <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.formGroupHalf}>
                    <label style={styles.label}>Outreach Type</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        style={styles.select}
                    >
                        {enums.outreachTypes.map(outType => (
                            <option key={outType} value={outType}>{outType.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={styles.formRow}>
                <div style={styles.formGroupHalf}>
                    <label style={styles.label}>LinkedIn URL</label>
                    <input 
                        type="url" 
                        value={linkedinUrl} 
                        placeholder="https://"
                        onChange={e => setLinkedinUrl(e.target.value)} 
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroupHalf}>
                    <label style={styles.label}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        placeholder="john.doe@company.com"
                        onChange={e => setEmail(e.target.value)} 
                        style={styles.input}
                    />
                </div>
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input 
                    type="text" 
                    value={phone} 
                    placeholder="e.g. +1 234 567 890"
                    onChange={e => setPhone(e.target.value)} 
                    style={styles.input}
                />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Outreach Template</label>
                <select 
                    onChange={handleTemplateChange}
                    style={styles.select}
                    defaultValue=""
                >
                    <option value="">-- Choose a template to pre-fill message --</option>
                    {templates.map(temp => (
                        <option key={temp._id} value={temp._id}>
                            {temp.name} ({temp.type.replace(/_/g, " ")})
                        </option>
                    ))}
                </select>
            </div>
            <div style={styles.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={styles.label}>Message/Intro Sent</label>
                    {message.trim() && (
                        <button
                            type="button"
                            onClick={handleAiTailor}
                            disabled={isTailoring}
                            style={styles.aiTailorBtn}
                        >
                            {isTailoring ? "Tailoring..." : "✨ AI Tailor Message"}
                        </button>
                    )}
                </div>
                <textarea 
                    value={message} 
                    rows={6}
                    placeholder="Message sent or planned template..."
                    onChange={e => setMessage(e.target.value)} 
                    style={styles.textarea}
                />
            </div>

            {showComparison && (
                <div style={styles.comparisonContainer}>
                    <h4 style={styles.comparisonHeader}>✨ AI Rewrite Comparison</h4>
                    <div style={styles.comparisonGrid}>
                        <div style={styles.comparisonCol}>
                            <strong style={{ fontSize: "12px", color: "var(--text)" }}>BEFORE (Original)</strong>
                            <div style={styles.comparisonBox}>{originalMessage}</div>
                        </div>
                        <div style={styles.comparisonCol}>
                            <strong style={{ fontSize: "12px", color: "#10b981" }}>AFTER (AI Tailored)</strong>
                            <div style={{ ...styles.comparisonBox, borderLeftColor: "#10b981" }}>{tailoredMessage}</div>
                        </div>
                    </div>
                    <div style={styles.comparisonActions}>
                        <button
                            type="button"
                            onClick={() => {
                                setMessage(tailoredMessage);
                                setShowComparison(false);
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                            ✓ Accept AI Version
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowComparison(false)}
                            className="btn btn-secondary"
                            style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                            Keep Original
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    style={styles.select}
                >
                    {enums.outreachStatuses.map(outStatus => (
                        <option key={outStatus} value={outStatus}>{outStatus.replace(/_/g, " ")}</option>
                    ))}
                </select>
            </div>
            <div style={styles.modalActions}>
                <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? "Adding..." : "Add Contact"}
                </button>
            </div>
        </form>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
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
        textAlign: "left",
    },
    formGroupHalf: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        textAlign: "left",
    },
    label: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "var(--text-h)",
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
    cancelBtn: {
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--text)",
        padding: "10px 16px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "15px",
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
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "12px",
    },
    aiTailorBtn: {
        background: "none",
        border: "1px solid var(--accent-border)",
        color: "var(--accent)",
        padding: "4px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "bold",
    },
    comparisonContainer: {
        background: "var(--code-bg)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "16px",
        marginTop: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    comparisonHeader: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "bold",
        color: "var(--text-h)",
    },
    comparisonGrid: {
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
    },
    comparisonCol: {
        flex: 1,
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    comparisonBox: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderLeftWidth: "4px",
        borderLeftColor: "var(--text)",
        borderRadius: "4px",
        padding: "10px",
        fontSize: "13px",
        lineHeight: "1.4",
        color: "var(--text-h)",
        whiteSpace: "pre-wrap",
        maxHeight: "150px",
        overflowY: "auto",
    },
    comparisonActions: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
    },
};
