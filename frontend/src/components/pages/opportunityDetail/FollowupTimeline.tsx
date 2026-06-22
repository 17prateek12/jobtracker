import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowups, createFollowup, deleteFollowup } from "../../../api/followup";
import type { Followup } from "../../../types/opportunity";

interface FollowupTimelineProps {
    outreachId: string;
}

export default function FollowupTimeline({ outreachId }: FollowupTimelineProps) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState("");
    const [notes, setNotes] = useState("");
    const [sentAt, setSentAt] = useState(new Date().toISOString().substring(0, 16));

    // React Query loaders
    const { data: followups = [], isLoading } = useQuery<Followup[]>({
        queryKey: ["followups", outreachId],
        queryFn: () => getFollowups(outreachId),
        enabled: !!outreachId,
    });

    // React Query mutations
    const createFollowupMutation = useMutation({
        mutationFn: (payload: any) => createFollowup({
            outreachId,
            ...payload,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followups", outreachId] });
            setIsAdding(false);
            setMessage("");
            setNotes("");
            setSentAt(new Date().toISOString().substring(0, 16));
        },
        onError: (error: any) => {
            console.error("Log followup error:", error);
            alert("Failed to log followup");
        }
    });

    const deleteFollowupMutation = useMutation({
        mutationFn: deleteFollowup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["followups", outreachId] });
        },
        onError: (error: any) => {
            console.error("Delete followup error:", error);
            alert("Failed to delete followup");
        }
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createFollowupMutation.mutate({
            message: message.trim() || undefined,
            notes: notes.trim() || undefined,
            sentAt: new Date(sentAt).toISOString(),
        });
    };

    return (
        <div style={styles.followupSection}>
            <div style={styles.followupHeader}>
                <h5 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "var(--text-h)" }}>
                    Follow-ups ({followups.length})
                </h5>
                {!isAdding ? (
                    <button onClick={() => setIsAdding(true)} style={styles.followupAddBtn}>
                        + Log Follow-up
                    </button>
                ) : (
                    <button onClick={() => setIsAdding(false)} style={styles.followupCancelBtn}>
                        Cancel
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={styles.followupForm}>
                    <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Date / Time</label>
                        <input 
                            type="datetime-local" 
                            value={sentAt} 
                            onChange={e => setSentAt(e.target.value)}
                            style={styles.inputSmall}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Message Sent</label>
                        <textarea 
                            value={message} 
                            rows={2}
                            placeholder="Followup message template or summary..."
                            onChange={e => setMessage(e.target.value)}
                            style={styles.textareaSmall}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.labelSmall}>Notes / Response</label>
                        <textarea 
                            value={notes} 
                            rows={2}
                            placeholder="Any reaction, notes, or next action..."
                            onChange={e => setNotes(e.target.value)}
                            style={styles.textareaSmall}
                        />
                    </div>
                    <button type="submit" style={styles.followupSubmitBtn} disabled={createFollowupMutation.isPending}>
                        {createFollowupMutation.isPending ? "Saving..." : "Save Follow-up"}
                    </button>
                </form>
            )}

            {isLoading ? (
                <div style={{ padding: "8px 0", fontSize: "12px", color: "var(--text)" }}>
                    Loading follow-ups...
                </div>
            ) : (
                followups.length > 0 && (
                    <div style={styles.followupTimeline}>
                        {followups.map(f => (
                            <div key={f._id} style={styles.timelineItem}>
                                <div style={styles.timelineDot} />
                                <div style={styles.timelineContent}>
                                    <div style={styles.timelineHeader}>
                                        <span style={styles.timelineDate}>
                                            {new Date(f.sentAt || "").toLocaleDateString(undefined, {
                                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm("Delete this follow-up record?")) {
                                                    deleteFollowupMutation.mutate(f._id);
                                                }
                                            }} 
                                            style={styles.deleteFollowupBtn}
                                            title="Delete Follow-up"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    {f.message && <p style={styles.timelineMessage}><strong>Msg:</strong> {f.message}</p>}
                                    {f.notes && <p style={styles.timelineNotes}><strong>Note:</strong> {f.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    followupSection: {
        marginTop: "16px",
        borderTop: "1px dashed var(--border)",
        paddingTop: "12px",
    },
    followupHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },
    followupAddBtn: {
        background: "none",
        border: "none",
        color: "var(--accent)",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
        padding: 0,
    },
    followupCancelBtn: {
        background: "none",
        border: "none",
        color: "var(--text)",
        cursor: "pointer",
        fontSize: "12px",
        padding: 0,
    },
    followupForm: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "12px",
        textAlign: "left",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    labelSmall: {
        fontSize: "11px",
        fontWeight: "bold",
        color: "var(--text)",
    },
    inputSmall: {
        padding: "4px 8px",
        border: "1px solid var(--border)",
        borderRadius: "3px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "13px",
    },
    textareaSmall: {
        padding: "4px 8px",
        border: "1px solid var(--border)",
        borderRadius: "3px",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: "13px",
        fontFamily: "var(--sans)",
        resize: "vertical",
    },
    followupSubmitBtn: {
        background: "var(--accent)",
        border: "none",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "3px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "bold",
        alignSelf: "flex-end",
    },
    followupTimeline: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        paddingLeft: "12px",
        borderLeft: "2px solid var(--border)",
        marginLeft: "4px",
        marginTop: "8px",
        textAlign: "left",
    },
    timelineItem: {
        position: "relative",
    },
    timelineDot: {
        position: "absolute",
        left: "-18px",
        top: "6px",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "var(--accent)",
        border: "2px solid var(--bg)",
    },
    timelineContent: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "8px 12px",
    },
    timelineHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
    },
    timelineDate: {
        fontSize: "11px",
        color: "var(--text)",
        fontWeight: "bold",
    },
    deleteFollowupBtn: {
        background: "none",
        border: "none",
        color: "var(--text)",
        fontSize: "16px",
        cursor: "pointer",
        lineHeight: 1,
        padding: 0,
    },
    timelineMessage: {
        fontSize: "12px",
        margin: "0 0 4px 0",
        color: "var(--text-h)",
    },
    timelineNotes: {
        fontSize: "12px",
        margin: 0,
        color: "var(--text)",
    },
};
