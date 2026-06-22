import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getResumes, getResumeVersions, uploadResumeFile, deleteResume, convertResume } from "../api/resume";
import Modal from "../components/Modal";

export default function Resumes() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Dialog states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedResumeName, setSelectedResumeName] = useState<string>("");

    // Form states
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [formError, setFormError] = useState("");
    const [convertingId, setConvertingId] = useState<string | null>(null);

    const handleConvertResume = async (id: string) => {
        setConvertingId(id);
        try {
            const result = await convertResume(id);
            alert(`Resume converted successfully! Created structured version: "${result.name}"`);
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
        } catch (err: any) {
            console.error("Conversion error:", err);
            alert(err?.response?.data?.message || "Failed to convert S3 PDF to structured resume.");
        } finally {
            setConvertingId(null);
        }
    };

    // Load active/latest resumes
    const { data: resumes = [], isLoading } = useQuery({
        queryKey: ["resumes"],
        queryFn: () => getResumes(false), // only latest versions
    });

    // Load selected resume version history
    const { data: history = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ["resumeVersions", selectedResumeName],
        queryFn: () => getResumeVersions(selectedResumeName),
        enabled: !!selectedResumeName,
    });

    // Mutations
    const uploadMutation = useMutation({
        mutationFn: ({ name, file }: { name: string; file: File }) => uploadResumeFile(name, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
            queryClient.invalidateQueries({ queryKey: ["resumeVersions", selectedResumeName] });
            setIsUploadModalOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message || "Failed to upload resume file");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteResume,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resumes"] });
            queryClient.invalidateQueries({ queryKey: ["resumeVersions", selectedResumeName] });
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to delete resume");
        },
    });

    const resetForm = () => {
        setName("");
        setFile(null);
        setFormError("");
    };

    const handleUploadResume = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setFormError("Resume Base Name is required");
        if (!file) return setFormError("Resume File attachment is required");

        uploadMutation.mutate({
            name: name.trim(),
            file,
        });
    };

    const handleDeleteResume = (id: string, version: number) => {
        if (window.confirm(`Are you sure you want to delete version ${version} of this resume?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            // If name is empty, prefill with file base name
            if (!name) {
                const base = e.target.files[0].name.split(".")[0];
                setName(base.replace(/[-_]+/g, " "));
            }
        }
    };

    const openUploadForNewVersion = (baseName: string) => {
        setName(baseName);
        setIsUploadModalOpen(true);
    };

    const openHistory = (baseName: string) => {
        setSelectedResumeName(baseName);
        setIsHistoryModalOpen(true);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={{ margin: "0 0 8px 0" }}>Resume Library</h1>
                    <p style={{ margin: 0, color: "var(--text)" }}>
                        Upload and organize multiple resume tracks. Older versions are preserved automatically to keep opportunity histories intact.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/resumes/builder")}
                    >
                        + Build Online
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setIsUploadModalOpen(true);
                        }}
                    >
                        + Upload Resume
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading resumes...</h2>
                </div>
            ) : resumes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-title">No Resumes Found</div>
                    <div className="empty-state-description">
                        Get started by uploading your first resume version (PDF or DOCX).
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: "12px" }}
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        Upload First Resume
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {resumes.map((resume) => (
                        <div key={resume._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <h3 style={styles.cardTitle}>{resume.name}</h3>
                                    <span style={styles.versionBadge}>Version {resume.version}</span>
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.actionBtn} onClick={() => openHistory(resume.name)}>
                                        📜 History
                                    </button>
                                    <button
                                        style={{ ...styles.actionBtn, color: "#ef4444" }}
                                        onClick={() => handleDeleteResume(resume._id, resume.version)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                            <div style={styles.infoBlock}>
                                <div style={styles.infoRow}>
                                    <strong>Type:</strong> <span>{resume.type}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <strong>Updated:</strong>{" "}
                                    <span>{new Date(resume.updatedAt!).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div style={styles.footerRow}>
                                {resume.type === "BUILT" ? (
                                    <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                                        <button
                                            onClick={() => navigate(`/resumes/builder/${resume._id}`)}
                                            className="btn btn-primary"
                                            style={styles.downloadBtn}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => navigate(`/resumes/builder/${resume._id}?tab=preview`)}
                                            className="btn btn-secondary"
                                            style={styles.downloadBtn}
                                        >
                                            🖨️ PDF/Print
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                                        {resume.s3Url && (
                                            <a
                                                href={resume.s3Url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary"
                                                style={{ ...styles.downloadBtn, padding: "8px 6px" }}
                                            >
                                                View S3
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleConvertResume(resume._id)}
                                            className="btn btn-secondary"
                                            style={{ ...styles.downloadBtn, padding: "8px 6px" }}
                                            disabled={convertingId === resume._id}
                                        >
                                            {convertingId === resume._id ? "Converting..." : "🔄 Convert"}
                                        </button>
                                    </div>
                                )}

                                {resume.type === "UPLOADED" && (
                                    <button
                                        onClick={() => openUploadForNewVersion(resume.name)}
                                        className="btn btn-primary"
                                        style={styles.versionBtn}
                                    >
                                        + Upload V{resume.version + 1}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Resume Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Resume Version">
                <form onSubmit={handleUploadResume} style={styles.form}>
                    {formError && <div style={styles.error}>{formError}</div>}
                    <div className="form-group">
                        <label className="form-label">Resume Track Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Backend Developer Resume"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <span style={{ fontSize: "12px", color: "var(--text)", marginTop: "4px", display: "block" }}>
                            * Using an existing name will create a new version of that track.
                        </span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Attach File (.pdf, .doc, .docx) *</label>
                        <input
                            type="file"
                            className="form-input"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsUploadModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Version History Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedResumeName("");
                }}
                title={`Version History: ${selectedResumeName}`}
                size="lg"
            >
                {isLoadingHistory ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <h3>Loading version timeline...</h3>
                    </div>
                ) : history.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <p>No version logs found.</p>
                    </div>
                ) : (
                    <div style={styles.timeline}>
                        {history.map((version) => (
                            <div key={version._id} style={styles.timelineItem}>
                                <div style={styles.timelineHeader}>
                                    <div>
                                        <strong style={{ fontSize: "16px" }}>Version {version.version}</strong>
                                        {version.isLatest && <span style={styles.latestBadge}>Active (Latest)</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        {version.s3Url && (
                                            <a
                                                href={version.s3Url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.timelineLink}
                                            >
                                                View file
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleDeleteResume(version._id, version.version)}
                                            style={styles.deleteLink}
                                        >
                                            Delete version
                                        </button>
                                    </div>
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text)", marginTop: "4px" }}>
                                    Uploaded on {new Date(version.createdAt!).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="modal-actions" style={{ marginTop: "24px" }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setIsHistoryModalOpen(false);
                            setSelectedResumeName("");
                        }}
                    >
                        Close
                    </button>
                </div>
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
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
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
        gap: "16px",
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
    versionBadge: {
        fontSize: "12px",
        background: "var(--accent-bg)",
        color: "var(--accent)",
        padding: "2px 8px",
        borderRadius: "12px",
        fontWeight: 600,
        display: "inline-block",
    },
    infoBlock: {
        fontSize: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px dashed var(--border)",
        paddingBottom: "4px",
    },
    footerRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        marginTop: "8px",
    },
    downloadBtn: {
        flex: 1,
        padding: "8px 12px",
        fontSize: "13px",
        textAlign: "center",
    },
    versionBtn: {
        padding: "8px 12px",
        fontSize: "13px",
        width: "auto",
    },
    actions: {
        display: "flex",
        gap: "8px",
    },
    actionBtn: {
        background: "none",
        border: "none",
        fontSize: "13px",
        cursor: "pointer",
        color: "var(--accent)",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    error: {
        color: "#ef4444",
        fontSize: "14px",
    },
    timeline: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        maxHeight: "350px",
        overflowY: "auto",
        paddingRight: "6px",
    },
    timelineItem: {
        background: "var(--code-bg)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "12px 16px",
        textAlign: "left",
    },
    timelineHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    timelineLink: {
        fontSize: "13px",
        color: "var(--accent)",
        textDecoration: "none",
        fontWeight: 500,
    },
    deleteLink: {
        fontSize: "13px",
        color: "#ef4444",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontWeight: 500,
    },
    latestBadge: {
        fontSize: "11px",
        background: "rgba(16, 185, 129, 0.15)",
        color: "#10b981",
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: 600,
        marginLeft: "8px",
        display: "inline-block",
    },
};
