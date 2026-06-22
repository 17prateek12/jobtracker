import { useState } from "react";
import type { Outreach } from "../../../types/opportunity";
import type { BackendEnums } from "../../../api/metadata";
import Modal from "../../Modal";
import OutreachForm from "./OutreachForm";
import OutreachCard from "./OutreachCard";

interface OutreachSectionProps {
    outreaches: Outreach[];
    enums: BackendEnums;
    onUpdateOutreachStatus: (id: string, status: string) => void;
    onDeleteOutreach: (id: string) => void;
    onCreateOutreach: (payload: any) => void;
}

export default function OutreachSection({
    outreaches,
    enums,
    onUpdateOutreachStatus,
    onDeleteOutreach,
    onCreateOutreach,
}: OutreachSectionProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleFormSubmit = async (payload: any) => {
        onCreateOutreach(payload);
        setIsAddModalOpen(false);
    };

    return (
        <div style={styles.panel}>
            <div style={styles.panelHeader}>
                <h2>Networking & Outreach</h2>
                <button onClick={() => setIsAddModalOpen(true)} style={styles.addBtn}>
                    + Add Contact
                </button>
            </div>

            {outreaches.length === 0 ? (
                <div style={styles.emptyOutreach}>
                    <p style={{ margin: 0, fontWeight: 500 }}>No outreach history recorded for this opportunity yet.</p>
                    <p style={styles.emptySub}>Add contacts you reached out to on LinkedIn or email to track follow-ups and referrals.</p>
                </div>
            ) : (
                <div style={styles.outreachList}>
                    {outreaches.map(out => (
                        <OutreachCard
                            key={out._id}
                            outreach={out}
                            enums={enums}
                            onUpdateStatus={onUpdateOutreachStatus}
                            onDeleteOutreach={onDeleteOutreach}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Outreach Contact"
                size="md"
            >
                <OutreachForm 
                    enums={enums}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>
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
    addBtn: {
        background: "var(--accent-bg)",
        border: "1px solid var(--accent-border)",
        color: "var(--accent)",
        padding: "6px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
    },
    emptyOutreach: {
        textAlign: "center",
        padding: "40px 20px",
        color: "var(--text)",
    },
    emptySub: {
        fontSize: "13px",
        color: "var(--text)",
        marginTop: "8px",
    },
    outreachList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginTop: "12px",
    },
};
