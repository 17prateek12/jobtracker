import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanyById } from "../api/company";
import { 
    createOpportunity, 
    getOpportunities, 
    deleteOpportunity 
} from "../api/opportunity";
import { getBackendEnums } from "../api/metadata";
import type { MouseEvent } from "react";
import Modal from "../components/Modal";
import OpportunityCard from "../components/OpportunityCard";
import CompanyDetailHeader from "../components/pages/companyDetail/CompanyDetailHeader";
import OpportunityForm from "../components/pages/companyDetail/OpportunityForm";

export default function CompanyDetail() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Opportunity Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // React Query fetch for Company Details
    const { data: company, isLoading: loadingCompany } = useQuery({
        queryKey: ["company", companyId],
        queryFn: () => getCompanyById(companyId!),
        enabled: !!companyId,
    });

    // React Query fetch for Opportunities
    const { data: jobsData, isLoading: loadingJobs } = useQuery({
        queryKey: ["opportunities", companyId],
        queryFn: () => getOpportunities({ companyId }),
        enabled: !!companyId,
    });

    // React Query fetch for Enums
    const { data: enums } = useQuery({
        queryKey: ["enums"],
        queryFn: getBackendEnums,
    });

    const jobs = jobsData?.items || [];
    const loading = loadingCompany || loadingJobs;

    // React Query mutations
    const createOpportunityMutation = useMutation({
        mutationFn: (payload: any) => createOpportunity({
            companyId: companyId!,
            ...payload,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunities", companyId] });
            setIsAddModalOpen(false);
        },
        onError: (error: any) => {
            console.error("Failed to create opportunity:", error);
            alert(error?.response?.data?.message || "Failed to create opportunity");
        }
    });

    const deleteOpportunityMutation = useMutation({
        mutationFn: deleteOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunities", companyId] });
        },
        onError: (error: any) => {
            console.error("Failed to delete opportunity:", error);
            alert("Failed to delete opportunity");
        }
    });

    const handleAddOpportunitySubmit = async (payload: any) => {
        createOpportunityMutation.mutate(payload);
    };

    const handleDeleteOpportunity = (e: MouseEvent, id: string, role: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the opportunity for ${role}?`)) {
            deleteOpportunityMutation.mutate(id);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <h2>Loading company details...</h2>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="empty-state">
                <div className="empty-state-title">Company Not Found</div>
                <button className="btn btn-primary" onClick={() => navigate("/company")}>
                    Back to Companies
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header Card */}
            <CompanyDetailHeader 
                company={company}
                onBack={() => navigate("/company")}
                onAddOpportunity={() => setIsAddModalOpen(true)}
            />

            {/* Opportunities List */}
            <div style={{ textAlign: "left" }}>
                <h3 style={{ fontSize: "20px", color: "var(--text-h)", margin: "0 0 16px 0" }}>Opportunities</h3>

                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💼</div>
                        <div className="empty-state-title">No Opportunities Listed</div>
                        <div className="empty-state-description">
                            You haven't tracked any job opportunities for {company.name} yet.
                        </div>
                        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                            Add Opportunity
                        </button>
                    </div>
                ) : (
                    <div className="opportunities-grid">
                        {jobs.map((job) => (
                            <OpportunityCard
                                key={job._id}
                                job={job}
                                onNavigate={(id) => navigate(`/opportunities/${id}`)}
                                onDelete={handleDeleteOpportunity}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Opportunity Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Opportunity"
                size="lg"
            >
                {enums && (
                    <OpportunityForm 
                        enums={enums}
                        onSubmit={handleAddOpportunitySubmit}
                        onCancel={() => setIsAddModalOpen(false)}
                        submitting={createOpportunityMutation.isPending}
                    />
                )}
            </Modal>
        </div>
    );
}