import { useState } from "react";
import type { FormEvent } from "react";
import type { BackendEnums } from "../../../api/metadata";

interface OutreachFormProps {
    enums: BackendEnums;
    onSubmit: (payload: any) => Promise<void>;
    onCancel: () => void;
}

export default function OutreachForm({ enums, onSubmit, onCancel }: OutreachFormProps) {
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
                <label style={styles.label}>Message/Intro Sent</label>
                <textarea 
                    value={message} 
                    rows={3}
                    placeholder="Message sent or planned template..."
                    onChange={e => setMessage(e.target.value)} 
                    style={styles.textarea}
                />
            </div>
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
};
