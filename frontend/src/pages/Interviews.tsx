import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviews, createInterview, updateInterview, deleteInterview } from "../api/interview";
import { getOpportunities } from "../api/opportunity";
import { getBackendEnums } from "../api/metadata";
import type { IInterview } from "../api/interview";
import type { Opportunity } from "../types/opportunity";
import Modal from "../components/Modal";

export default function Interviews() {
    const queryClient = useQueryClient();

    // Filters state
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<IInterview | null>(null);

    // Form scheduling state
    const [opportunityId, setOpportunityId] = useState("");
    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(45);
    const [notes, setNotes] = useState("");
    const [scheduleError, setScheduleError] = useState("");

    // Form editing state
    const [editStatus, setEditStatus] = useState<"SCHEDULED" | "COMPLETED" | "CANCELLED">("SCHEDULED");
    const [editNotes, setEditNotes] = useState("");
    const [editFeedback, setEditFeedback] = useState("");
    const [editError, setEditError] = useState("");

    // Fetch data using React Query
    const { data: interviews = [], isLoading: isLoadingInterviews } = useQuery<IInterview[]>({
        queryKey: ["interviews"],
        queryFn: getInterviews,
    });

    const { data: oppsData } = useQuery({
        queryKey: ["opportunities-all-list"],
        queryFn: () => getOpportunities({ limit: 100 }),
    });

    const { data: enums } = useQuery({
        queryKey: ["enums"],
        queryFn: getBackendEnums,
    });

    const opportunities = oppsData?.items || [];

    // Mutations
    const scheduleMutation = useMutation({
        mutationFn: createInterview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interviews"] });
            queryClient.invalidateQueries({ queryKey: ["opportunities"] });
            setIsScheduleModalOpen(false);
            resetScheduleForm();
        },
        onError: (err: any) => {
            setScheduleError(err?.response?.data?.message || "Failed to schedule interview");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<IInterview> }) =>
            updateInterview(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interviews"] });
            setIsEditModalOpen(false);
            setSelectedInterview(null);
            resetEditForm();
        },
        onError: (err: any) => {
            setEditError(err?.response?.data?.message || "Failed to update interview");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInterview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interviews"] });
        },
        onError: (err: any) => {
            alert(err?.response?.data?.message || "Failed to delete interview");
        },
    });

    const resetScheduleForm = () => {
        setOpportunityId("");
        setTitle("");
        setType(enums?.interviewTypes?.[0] || "");
        setScheduledAt("");
        setDurationMinutes(45);
        setNotes("");
        setScheduleError("");
    };

    const resetEditForm = () => {
        setEditStatus("SCHEDULED");
        setEditNotes("");
        setEditFeedback("");
        setEditError("");
    };

    const handleOpenSchedule = () => {
        resetScheduleForm();
        if (enums?.interviewTypes && enums.interviewTypes.length > 0) {
            setType(enums.interviewTypes[0]);
        }
        setIsScheduleModalOpen(true);
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!opportunityId) {
            setScheduleError("Please select a target opportunity");
            return;
        }
        if (!title.trim()) {
            setScheduleError("Please enter an interview title");
            return;
        }
        if (!type) {
            setScheduleError("Please select an interview type");
            return;
        }
        if (!scheduledAt) {
            setScheduleError("Please select a date and time");
            return;
        }

        scheduleMutation.mutate({
            opportunityId,
            title: title.trim(),
            type,
            scheduledAt: new Date(scheduledAt).toISOString(),
            durationMinutes,
            notes: notes.trim() || undefined,
        });
    };

    const handleOpenEdit = (interview: IInterview) => {
        setSelectedInterview(interview);
        setEditStatus(interview.status);
        setEditNotes(interview.notes || "");
        setEditFeedback(interview.feedback || "");
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInterview) return;

        updateMutation.mutate({
            id: selectedInterview._id,
            payload: {
                status: editStatus,
                notes: editNotes.trim(),
                feedback: editStatus === "COMPLETED" ? editFeedback.trim() : undefined,
            },
        });
    };

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete the scheduled interview "${title}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const formatEnum = (str: string) => {
        if (!str) return "";
        return str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "SCHEDULED": return "status-badge interview";
            case "COMPLETED": return "status-badge offer";
            case "CANCELLED": return "status-badge rejected";
            default: return "status-badge saved";
        }
    };

    const getOpportunityLabel = (opp: Opportunity) => {
        const companyName = typeof opp.companyId === "object" ? opp.companyId.name : "Unknown Company";
        return `${companyName} - ${formatEnum(opp.jobRole)} (${formatEnum(opp.jobLevel)})`;
    };

    // Filter interviews
    const filteredInterviews = interviews.filter((item) => {
        if (statusFilter === "ALL") return true;
        return item.status === statusFilter;
    });

    // Separate into Upcoming and Past
    const now = new Date();
    const upcomingInterviews = filteredInterviews
        .filter((item) => new Date(item.scheduledAt) >= now && item.status === "SCHEDULED")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const pastOrOtherInterviews = filteredInterviews
        .filter((item) => new Date(item.scheduledAt) < now || item.status !== "SCHEDULED")
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return (
        <div style={{ textAlign: "left" }}>
            {/* Header section */}
            <div style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>Interviews</h1>
                    <p style={{ color: "var(--text)", marginTop: "4px" }}>
                        Manage and track your interview rounds, schedules, and record valuable feedback.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenSchedule}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="12" y1="14" x2="12" y2="20" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                    Schedule Interview
                </button>
            </div>

            {/* Filter buttons */}
            <div style={styles.filterBar}>
                {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((status) => (
                    <button
                        key={status}
                        className={`btn ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter(status)}
                        style={{ padding: "6px 14px", fontSize: "14px" }}
                    >
                        {formatEnum(status)}
                    </button>
                ))}
            </div>

            {isLoadingInterviews ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading interviews...</h2>
                </div>
            ) : interviews.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <div className="empty-state-title">No Interviews Tracked Yet</div>
                    <div className="empty-state-description">
                        Schedule interview rounds with target companies here to keep tabs on your schedule and prepare.
                    </div>
                    {opportunities.length === 0 ? (
                        <button className="btn btn-primary" onClick={() => window.location.href = "/opportunities"}>
                            Go to Opportunities to Create One
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleOpenSchedule}>
                            Schedule Your First Interview
                        </button>
                    )}
                </div>
            ) : (
                <div style={styles.timelineContainer}>
                    {/* Upcoming Section */}
                    {upcomingInterviews.length > 0 && (
                        <div style={{ marginBottom: "32px" }}>
                            <h2 style={styles.sectionTitle}>
                                <span style={styles.indicatorDotLive}></span> Upcoming Rounds
                            </h2>
                            <div style={styles.grid}>
                                {upcomingInterviews.map((item) => (
                                    <InterviewCard
                                        key={item._id}
                                        item={item}
                                        onEdit={handleOpenEdit}
                                        onDelete={handleDelete}
                                        formatEnum={formatEnum}
                                        getStatusClass={getStatusClass}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past & Other Section */}
                    <div>
                        <h2 style={styles.sectionTitle}>
                            {upcomingInterviews.length > 0 ? "Past & Other Rounds" : "Rounds Timeline"}
                        </h2>
                        {pastOrOtherInterviews.length === 0 ? (
                            <p style={{ color: "var(--text)", fontSize: "15px" }}>No historical or cancelled rounds to display.</p>
                        ) : (
                            <div style={styles.grid}>
                                {pastOrOtherInterviews.map((item) => (
                                    <InterviewCard
                                        key={item._id}
                                        item={item}
                                        onEdit={handleOpenEdit}
                                        onDelete={handleDelete}
                                        formatEnum={formatEnum}
                                        getStatusClass={getStatusClass}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Schedule Interview Modal */}
            <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Interview">
                <form onSubmit={handleScheduleSubmit}>
                    {scheduleError && (
                        <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                            {scheduleError}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Target Opportunity *</label>
                        {opportunities.length === 0 ? (
                            <div style={{ color: "#f59e0b", fontSize: "14px" }}>
                                No active opportunities found. Set up an opportunity before scheduling.
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                value={opportunityId}
                                onChange={(e) => setOpportunityId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Opportunity --</option>
                                {opportunities.map((opp) => (
                                    <option key={opp._id} value={opp._id}>
                                        {getOpportunityLabel(opp)}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Interview Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Technical Round 1: React & System Design"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                            <label className="form-label">Interview Type *</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                {enums?.interviewTypes?.map((t: string) => (
                                    <option key={t} value={t}>
                                        {formatEnum(t)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duration (Minutes)</label>
                            <input
                                type="number"
                                className="form-input"
                                min={5}
                                max={300}
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date & Time *</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Preparation Notes</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Interviewer names, topics to cover, questions to ask..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsScheduleModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={scheduleMutation.isPending || opportunities.length === 0}
                        >
                            {scheduleMutation.isPending ? "Scheduling..." : "Schedule Round"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Interview Status & Feedback Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Interview Details">
                {selectedInterview && (
                    <form onSubmit={handleEditSubmit}>
                        {editError && (
                            <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                                {editError}
                            </div>
                        )}

                        <div style={{ marginBottom: "16px", padding: "12px", background: "var(--code-bg)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "13px", color: "var(--text)" }}>Opportunity</div>
                            <div style={{ fontWeight: 500, color: "var(--text-h)" }}>
                                {selectedInterview.opportunityId?.companyId?.name} — {selectedInterview.opportunityId?.jobRole}
                            </div>
                            <div style={{ fontSize: "14px", marginTop: "4px" }}>{selectedInterview.title}</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Round Status</label>
                            <select
                                className="form-select"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                            >
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Interviewer Notes</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                            />
                        </div>

                        {editStatus === "COMPLETED" && (
                            <div className="form-group" style={{ animation: "fadeIn 0.2s" }}>
                                <label className="form-label">Post-Round Feedback & Questions Faced *</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Write details of what went well, coding questions asked, and areas of improvement..."
                                    value={editFeedback}
                                    onChange={(e) => setEditFeedback(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

interface CardProps {
    item: IInterview;
    onEdit: (item: IInterview) => void;
    onDelete: (id: string, title: string) => void;
    formatEnum: (s: string) => string;
    getStatusClass: (status: string) => string;
}

function InterviewCard({ item, onEdit, onDelete, formatEnum, getStatusClass }: CardProps) {
    const dateObj = new Date(item.scheduledAt);
    const dateFormatted = dateObj.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const timeFormatted = dateObj.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });

    const companyName = item.opportunityId?.companyId?.name || "Unknown Company";
    const jobRole = item.opportunityId?.jobRole || "Opportunity";

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div>
                    <span className={getStatusClass(item.status)} style={{ marginRight: "8px" }}>
                        {item.status}
                    </span>
                    <span style={styles.typeBadge}>{formatEnum(item.type)}</span>
                </div>
                <div style={styles.actions}>
                    <button
                        className="btn-icon"
                        onClick={() => onEdit(item)}
                        title="Edit round info"
                        style={{ padding: "4px", borderRadius: "4px" }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button
                        className="btn-icon"
                        onClick={() => onDelete(item._id, item.title)}
                        title="Delete schedule"
                        style={{ padding: "4px", borderRadius: "4px", color: "#ef4444" }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            <h3 style={styles.cardTitle}>{item.title}</h3>
            
            <div style={styles.companyInfo}>
                🏢 {companyName} — <span style={{ fontWeight: 500 }}>{formatEnum(jobRole)}</span>
            </div>

            <div style={styles.metaRow}>
                <div>📅 {dateFormatted} at {timeFormatted}</div>
                <div>⏱️ {item.durationMinutes} mins</div>
            </div>

            {item.notes && (
                <div style={styles.notesBlock}>
                    <strong style={{ fontSize: "12px", color: "var(--text-h)", display: "block", marginBottom: "2px" }}>Notes:</strong>
                    {item.notes}
                </div>
            )}

            {item.status === "COMPLETED" && item.feedback && (
                <div style={styles.feedbackBlock}>
                    <strong style={{ fontSize: "12px", color: "#10b981", display: "block", marginBottom: "2px" }}>Post-Round Feedback:</strong>
                    {item.feedback}
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px",
    },
    filterBar: {
        display: "flex",
        gap: "10px",
        marginBottom: "24px",
        flexWrap: "wrap",
    },
    timelineContainer: {
        marginTop: "16px",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: 500,
        color: "var(--text-h)",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "8px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    indicatorDotLive: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#10b981",
        display: "inline-block",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.3)",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "18px",
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        position: "relative",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    typeBadge: {
        backgroundColor: "var(--code-bg)",
        color: "var(--text-h)",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 500,
        textTransform: "uppercase",
    },
    actions: {
        display: "flex",
        gap: "6px",
    },
    cardTitle: {
        fontSize: "16px",
        fontWeight: 500,
        margin: "0 0 6px 0",
        color: "var(--text-h)",
        lineHeight: "1.3",
    },
    companyInfo: {
        fontSize: "14px",
        color: "var(--text)",
        marginBottom: "10px",
    },
    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "13px",
        color: "var(--text)",
        marginBottom: "12px",
        background: "var(--code-bg)",
        padding: "6px 10px",
        borderRadius: "6px",
    },
    notesBlock: {
        fontSize: "13px",
        color: "var(--text)",
        background: "rgba(244, 243, 236, 0.3)",
        padding: "8px 10px",
        borderRadius: "6px",
        borderLeft: "3px solid var(--border)",
        marginTop: "8px",
        whiteSpace: "pre-wrap",
    },
    feedbackBlock: {
        fontSize: "13px",
        color: "var(--text)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        padding: "8px 10px",
        borderRadius: "6px",
        borderLeft: "3px solid #10b981",
        marginTop: "10px",
        whiteSpace: "pre-wrap",
    },
};
