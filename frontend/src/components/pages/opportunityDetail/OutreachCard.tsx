import type { Outreach } from "../../../types/opportunity";
import type { BackendEnums } from "../../../api/metadata";
import FollowupTimeline from "./FollowupTimeline";

interface OutreachCardProps {
    outreach: Outreach;
    enums: BackendEnums;
    onUpdateStatus: (id: string, status: string) => void;
    onDeleteOutreach: (id: string) => void;
}

export default function OutreachCard({
    outreach,
    enums,
    onUpdateStatus,
    onDeleteOutreach,
}: OutreachCardProps) {

    const getOutreachStatusBg = (status: string) => {
        switch (status) {
            case "DRAFT": return "#e5e7eb";
            case "SENT": return "#dbeafe";
            case "FOLLOWUP": return "#fef3c7";
            case "RESPONDED": return "#d1fae5";
            case "REFERRAL_GIVEN": return "#f3e8ff";
            case "REJECTED": return "#fee2e2";
            default: return "#f3f4f6";
        }
    };

    return (
        <div style={styles.outreachCard}>
            <div style={styles.outreachHeader}>
                <div style={{ textAlign: "left" }}>
                    <h4 style={styles.contactNameTitle}>
                        {outreach.contactName || "Unnamed Contact"}
                    </h4>
                    <div style={styles.contactMetadata}>
                        <span style={styles.contactBadge}>{outreach.contactRole}</span>
                        <span style={styles.outreachTypeBadge}>{outreach.type}</span>
                    </div>
                </div>
                <div style={styles.outreachHeaderRight}>
                    <select
                        value={outreach.status}
                        onChange={e => onUpdateStatus(outreach._id, e.target.value)}
                        style={{
                            ...styles.outreachStatusSelect,
                            backgroundColor: getOutreachStatusBg(outreach.status)
                        }}
                    >
                        {enums.outreachStatuses.map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => onDeleteOutreach(outreach._id)} 
                        style={styles.deleteOutreachBtn}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Contact Links */}
            <div style={styles.contactLinks}>
                {outreach.linkedinUrl && (
                    <a href={outreach.linkedinUrl} target="_blank" rel="noopener noreferrer" style={styles.iconLink}>
                        LinkedIn &nearr;
                    </a>
                )}
                {outreach.email && (
                    <a href={`mailto:${outreach.email}`} style={styles.iconLink}>
                        Email: {outreach.email}
                    </a>
                )}
                {outreach.phone && <span style={styles.contactPhone}>Tel: {outreach.phone}</span>}
            </div>

            {outreach.message && (
                <div style={styles.outreachNoteBlock}>
                    <strong>Intro Message:</strong>
                    <p style={styles.preTextSmall}>{outreach.message}</p>
                </div>
            )}

            {outreach.notes && (
                <div style={styles.outreachNoteBlock}>
                    <strong>Notes:</strong>
                    <p style={styles.preTextSmall}>{outreach.notes}</p>
                </div>
            )}

            {/* Followups timeline */}
            <FollowupTimeline 
                outreachId={outreach._id}
            />
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    outreachCard: {
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "16px",
        background: "rgba(244, 243, 236, 0.2)",
    },
    outreachHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        gap: "10px",
    },
    contactNameTitle: {
        margin: "0 0 4px 0",
        fontSize: "16px",
        color: "var(--text-h)",
        fontWeight: "bold",
    },
    contactMetadata: {
        display: "flex",
        gap: "6px",
        alignItems: "center",
    },
    contactBadge: {
        background: "var(--border)",
        color: "var(--text-h)",
        fontSize: "11px",
        fontWeight: "bold",
        padding: "2px 6px",
        borderRadius: "3px",
    },
    outreachTypeBadge: {
        background: "var(--code-bg)",
        color: "var(--text)",
        fontSize: "11px",
        padding: "2px 6px",
        borderRadius: "3px",
        border: "1px solid var(--border)",
    },
    outreachHeaderRight: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    outreachStatusSelect: {
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "3px 6px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        color: "#111827",
        outline: "none",
    },
    deleteOutreachBtn: {
        background: "none",
        border: "none",
        color: "#dc2626",
        cursor: "pointer",
        fontSize: "12px",
        padding: 0,
        fontWeight: 500,
    },
    contactLinks: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        margin: "10px 0 0 0",
        fontSize: "13px",
    },
    iconLink: {
        color: "var(--accent)",
        textDecoration: "none",
        fontWeight: 500,
    },
    contactPhone: {
        color: "var(--text)",
    },
    outreachNoteBlock: {
        marginTop: "12px",
        background: "var(--bg)",
        padding: "8px 12px",
        borderRadius: "4px",
        border: "1px solid var(--border)",
        fontSize: "13px",
        textAlign: "left",
    },
    preTextSmall: {
        whiteSpace: "pre-wrap",
        margin: "4px 0 0 0",
        fontSize: "13px",
        color: "var(--text)",
        lineHeight: "1.4",
    },
};
