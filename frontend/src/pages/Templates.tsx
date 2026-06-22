import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../api/template";
import type { ITemplate } from "../api/template";
import Modal from "../components/Modal";

export default function Templates() {
    const queryClient = useQueryClient();
    
    // Dialog states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [type, setType] = useState<ITemplate["type"]>("REFERRAL");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [formError, setFormError] = useState("");

    // Load templates list
    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["templates"],
        queryFn: getTemplates,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            setIsAddModalOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message || "Failed to create template");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<ITemplate> }) => updateTemplate(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message || "Failed to update template");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to delete template");
        }
    });

    const resetForm = () => {
        setName("");
        setType("REFERRAL");
        setSubject("");
        setContent("");
        setFormError("");
        setSelectedTemplate(null);
    };

    const handleCreateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setFormError("Template Name is required");
        if (!content.trim()) return setFormError("Template Content is required");

        createMutation.mutate({
            name: name.trim(),
            type,
            subject: type === "COLD_EMAIL" ? subject.trim() : undefined,
            content: content.trim(),
        });
    };

    const handleEditTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;
        if (!name.trim()) return setFormError("Template Name is required");
        if (!content.trim()) return setFormError("Template Content is required");

        updateMutation.mutate({
            id: selectedTemplate._id,
            payload: {
                name: name.trim(),
                type,
                subject: type === "COLD_EMAIL" ? subject.trim() : undefined,
                content: content.trim(),
            }
        });
    };

    const handleDeleteTemplate = (id: string, tempName: string) => {
        if (window.confirm(`Are you sure you want to delete template "${tempName}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const openEdit = (template: ITemplate) => {
        setSelectedTemplate(template);
        setName(template.name);
        setType(template.type);
        setSubject(template.subject || "");
        setContent(template.content);
        setIsEditModalOpen(true);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={{ margin: "0 0 8px 0" }}>Outreach Templates</h1>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    + Add Template
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading templates...</h2>
                </div>
            ) : templates.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No Templates Created</div>
                    <div className="empty-state-description">Add custom outreach messages for LinkedIn, email, and referral requests.</div>
                    <button className="btn btn-primary" style={{ marginTop: "12px" }} onClick={() => setIsAddModalOpen(true)}>
                        Create Template
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {templates.map(template => (
                        <div key={template._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <h3 style={styles.cardTitle}>{template.name}</h3>
                                    <span style={{ ...styles.badge, ...styles[template.type.toLowerCase()] }}>
                                        {template.type.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.actionBtn} onClick={() => openEdit(template)}>Edit</button>
                                    <button style={{ ...styles.actionBtn, color: "#ef4444" }} onClick={() => handleDeleteTemplate(template._id, template.name)}>Delete</button>
                                </div>
                            </div>
                            {template.subject && (
                                <div style={styles.subjectBlock}>
                                    <strong>Subject:</strong> {template.subject}
                                </div>
                            )}
                            <div style={styles.contentBlock}>
                                {template.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Template Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Template">
                <form onSubmit={handleCreateTemplate} style={styles.form}>
                    {formError && <div style={styles.error}>{formError}</div>}
                    <div className="form-group">
                        <label className="form-label">Template Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. LinkedIn Referral Request V1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-row" style={styles.row}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Template Type *</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={e => setType(e.target.value as ITemplate["type"])}
                            >
                                <option value="REFERRAL">Referral Request</option>
                                <option value="COLD_EMAIL">Cold Email</option>
                                <option value="LINKEDIN_DM">LinkedIn DM</option>
                                <option value="FOLLOWUP">Follow-up Message</option>
                            </select>
                        </div>
                    </div>
                    {type === "COLD_EMAIL" && (
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Inquiry regarding {{role}} opening"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Content *</label>
                        <textarea
                            className="form-textarea"
                            rows={8}
                            placeholder="Write your template. Use placeholders like {{company}}, {{role}}, {{name}}, {{jobUrl}}, and {{yourName}}"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Template Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Template">
                <form onSubmit={handleEditTemplate} style={styles.form}>
                    {formError && <div style={styles.error}>{formError}</div>}
                    <div className="form-group">
                        <label className="form-label">Template Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. LinkedIn Referral Request V1"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-row" style={styles.row}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Template Type *</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={e => setType(e.target.value as ITemplate["type"])}
                            >
                                <option value="REFERRAL">Referral Request</option>
                                <option value="COLD_EMAIL">Cold Email</option>
                                <option value="LINKEDIN_DM">LinkedIn DM</option>
                                <option value="FOLLOWUP">Follow-up Message</option>
                            </select>
                        </div>
                    </div>
                    {type === "COLD_EMAIL" && (
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Inquiry regarding {{role}} opening"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Content *</label>
                        <textarea
                            className="form-textarea"
                            rows={8}
                            placeholder="Write your template. Use placeholders like {{company}}, {{role}}, {{name}}, {{jobUrl}}, and {{yourName}}"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        textAlign: "left",
        boxSizing: "border-box",
        width: "100%",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: "16px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: "20px",
        marginTop: "16px",
    },
    card: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cardTitle: {
        margin: "0 0 4px 0",
        fontSize: "18px",
        fontWeight: 600,
        color: "var(--text-h)",
    },
    badge: {
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "12px",
        display: "inline-block",
    },
    referral: { background: "rgba(170, 59, 255, 0.1)", color: "var(--accent)" },
    cold_email: { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
    linkedin_dm: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
    followup: { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
    subjectBlock: {
        fontSize: "13px",
        padding: "6px 10px",
        background: "var(--code-bg)",
        borderRadius: "4px",
        borderLeft: "3px solid var(--accent)",
        color: "var(--text-h)",
    },
    contentBlock: {
        fontSize: "14px",
        lineHeight: "1.5",
        background: "var(--code-bg)",
        padding: "12px",
        borderRadius: "6px",
        color: "var(--text)",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        maxHeight: "150px",
        overflowY: "auto",
    },
    actions: {
        display: "flex",
        gap: "8px",
    },
    actionBtn: {
        background: "none",
        border: "none",
        fontSize: "12px",
        cursor: "pointer",
        color: "var(--text)",
        padding: "2px 4px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    row: {
        display: "flex",
        gap: "12px",
    },
    error: {
        color: "#ef4444",
        fontSize: "14px",
    },
};
