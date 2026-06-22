import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunity, updateOpportunity } from "../api/opportunity";
import { getOutreaches, createOutreach, updateOutreach, deleteOutreach } from "../api/outreach";
import { getBackendEnums } from "../api/metadata";
import type { BackendEnums } from "../api/metadata";

import OpportunityInfo from "../components/pages/opportunityDetail/OpportunityInfo";
import OutreachSection from "../components/pages/opportunityDetail/OutreachSection";

const defaultEnums: BackendEnums = {
    opportunityStatuses: [],
    opportunitySources: [],
    jobLevels: [],
    jobRoles: [],
    contactRoles: [],
    outreachTypes: [],
    outreachStatuses: [],
    requiredSkills: [],
};

export default function OpportunityDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // React Query loaders
    const { data: opportunity, isLoading: loadingOpp } = useQuery({
        queryKey: ["opportunity", id],
        queryFn: () => getOpportunity(id!),
        enabled: !!id,
    });

    const { data: outreachesData, isLoading: loadingOutreaches } = useQuery({
        queryKey: ["outreaches", id],
        queryFn: () => getOutreaches(id!),
        enabled: !!id,
    });

    const { data: enums } = useQuery({
        queryKey: ["enums"],
        queryFn: getBackendEnums,
    });

    const outreaches = outreachesData?.items || (Array.isArray(outreachesData) ? outreachesData : []);
    const loading = loadingOpp || loadingOutreaches;

    // React Query mutations
    const updateOpportunityMutation = useMutation({
        mutationFn: (form: any) => updateOpportunity(id!, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
        },
        onError: (error: any) => {
            console.error("Failed to update opportunity:", error);
            alert("Failed to update opportunity");
        }
    });

    const updateOutreachMutation = useMutation({
        mutationFn: ({ outId, payload }: { outId: string; payload: any }) => updateOutreach(outId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outreaches", id] });
        },
        onError: (error: any) => {
            console.error("Failed to update outreach:", error);
            alert("Failed to update outreach");
        }
    });

    const deleteOutreachMutation = useMutation({
        mutationFn: deleteOutreach,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outreaches", id] });
        },
        onError: (error: any) => {
            console.error("Failed to delete outreach:", error);
            alert("Failed to delete outreach");
        }
    });

    const createOutreachMutation = useMutation({
        mutationFn: (payload: any) => createOutreach({
            opportunityId: id!,
            ...payload,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outreaches", id] });
        },
        onError: (error: any) => {
            console.error("Failed to create outreach:", error);
            alert("Failed to create outreach");
        }
    });

    const handleUpdateOpportunity = async (form: any) => {
        updateOpportunityMutation.mutate(form);
    };

    const handleQuickStatusChange = async (newStatus: string) => {
        updateOpportunityMutation.mutate({ status: newStatus });
    };

    const handleUpdateOutreachStatus = async (outId: string, newStatus: string) => {
        updateOutreachMutation.mutate({ outId, payload: { status: newStatus } });
    };

    const handleDeleteOutreach = async (outId: string) => {
        if (window.confirm("Are you sure you want to delete this outreach contact?")) {
            deleteOutreachMutation.mutate(outId);
        }
    };

    const handleCreateOutreach = async (payload: any) => {
        createOutreachMutation.mutate(payload);
    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <h2>Loading opportunity details...</h2>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div style={styles.centerContainer}>
                <h2>Opportunity not found.</h2>
            </div>
        );
    }

    const comp = opportunity.companyId as any;
    const companyName = comp ? comp.name : "Unknown Company";

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    &larr; Back
                </button>
                <h1 style={styles.title}>
                    Opportunity Detail
                </h1>
                <p style={styles.subtitle}>
                    Role at <span style={styles.companyName}>{companyName}</span>
                </p>
            </div>

            <div style={styles.grid}>
                {/* Left panel: Opportunity Info */}
                <OpportunityInfo 
                    opportunity={opportunity}
                    enums={enums || defaultEnums}
                    onUpdate={handleUpdateOpportunity}
                    onQuickStatusChange={handleQuickStatusChange}
                />

                {/* Right panel: Outreach and followups */}
                <OutreachSection 
                    outreaches={outreaches}
                    enums={enums || defaultEnums}
                    onUpdateOutreachStatus={handleUpdateOutreachStatus}
                    onDeleteOutreach={handleDeleteOutreach}
                    onCreateOutreach={handleCreateOutreach}
                />
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    centerContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        color: "var(--text)",
    },
    container: {
        textAlign: "left",
        padding: "24px",
        boxSizing: "border-box",
        width: "100%",
    },
    header: {
        borderBottom: "1px solid var(--border)",
        paddingBottom: "20px",
        marginBottom: "24px",
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "var(--accent)",
        cursor: "pointer",
        padding: 0,
        fontSize: "15px",
        marginBottom: "12px",
        fontFamily: "var(--sans)",
        display: "block",
    },
    title: {
        margin: "0 0 8px 0",
        fontSize: "32px",
        fontWeight: 600,
        color: "var(--text-h)",
    },
    subtitle: {
        fontSize: "16px",
        color: "var(--text)",
        margin: 0,
    },
    companyName: {
        fontWeight: "bold",
        color: "var(--text-h)",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        alignItems: "start",
    },
};