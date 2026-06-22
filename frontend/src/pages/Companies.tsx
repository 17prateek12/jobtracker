import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany 
} from "../api/company";
import type { Company } from "../types/company";
import Modal from "../components/Modal";
import CompanyCard from "../components/CompanyCard";

export default function Companies() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [website, setWebsite] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [formError, setFormError] = useState("");

    // Debounced search query
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on search change
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // React Query loader for companies list
    const { data, isLoading } = useQuery({
        queryKey: ["companies", debouncedSearch, page],
        queryFn: () => getCompanies(debouncedSearch, page, 12),
    });

    const companies = data?.items || [];
    const totalPages = data?.pagination?.totalPages || 1;
    const totalItems = data?.pagination?.total || 0;

    // React Query mutations
    const createCompanyMutation = useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            setIsAddModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            setFormError(error?.response?.data?.message || "Failed to create company");
        }
    });

    const updateCompanyMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateCompany(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            setIsEditModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            setFormError(error?.response?.data?.message || "Failed to update company");
        }
    });

    const deleteCompanyMutation = useMutation({
        mutationFn: deleteCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message || "Failed to delete company");
        }
    });

    const handleAddCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setFormError("Company name is required");
            return;
        }
        createCompanyMutation.mutate({
            name: name.trim(),
            website: website.trim() || undefined,
            linkedinUrl: linkedinUrl.trim() || undefined,
        });
    };

    const handleEditCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !selectedCompany) {
            setFormError("Company name is required");
            return;
        }
        updateCompanyMutation.mutate({
            id: selectedCompany._id,
            payload: {
                name: name.trim(),
                website: website.trim() || undefined,
                linkedinUrl: linkedinUrl.trim() || undefined,
            }
        });
    };

    const handleDeleteCompany = (e: React.MouseEvent, id: string, compName: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete ${compName}? This will not delete the associated opportunities directly.`)) {
            deleteCompanyMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setName("");
        setWebsite("");
        setLinkedinUrl("");
        setFormError("");
        setSelectedCompany(null);
    };

    const openEditModal = (e: React.MouseEvent, company: Company) => {
        e.stopPropagation();
        setSelectedCompany(company);
        setName(company.name);
        setWebsite(company.website || "");
        setLinkedinUrl(company.linkedinUrl || "");
        setIsEditModalOpen(true);
    };

    return (
        <div>
            <div className="companies-header">
                <div className="search-wrapper">
                    <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search companies by name..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Company
                </button>
            </div>

            {isLoading && companies.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading companies...</h2>
                </div>
            ) : companies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <div className="empty-state-title">No Companies Found</div>
                    <div className="empty-state-description">
                        {search 
                            ? "Try refining your search text or add this company as a new record." 
                            : "Get started by adding your first company."}
                    </div>
                    {!search && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setIsAddModalOpen(true);
                            }}
                        >
                            Create First Company
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="companies-grid">
                        {companies.map((company) => (
                            <CompanyCard
                                key={company._id}
                                company={company}
                                onNavigate={(id) => navigate(`/companies/${id}`)}
                                onEdit={openEditModal}
                                onDelete={handleDeleteCompany}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <span className="pagination-text">
                                Showing page {page} of {totalPages} ({totalItems} total companies)
                            </span>
                            <div className="pagination-buttons">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Company Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Company"
            >
                <form onSubmit={handleAddCompany}>
                    {formError && (
                        <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                            {formError}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Company Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Google"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Website URL</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. google.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">LinkedIn URL</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="e.g. https://linkedin.com/company/google"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={createCompanyMutation.isPending}>
                            {createCompanyMutation.isPending ? "Adding..." : "Add Company"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Company Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Company"
            >
                <form onSubmit={handleEditCompany}>
                    {formError && (
                        <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
                            {formError}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Company Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Google"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Website URL</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. google.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">LinkedIn URL</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="e.g. https://linkedin.com/company/google"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={updateCompanyMutation.isPending}>
                            {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}