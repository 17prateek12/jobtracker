import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunities, createOpportunity, deleteOpportunity } from "../api/opportunity";
import { getCompanies } from "../api/company";
import { getBackendEnums } from "../api/metadata";
import type { Company } from "../types/company";
import type { BackendEnums } from "../api/metadata";
import Modal from "../components/Modal";
import OpportunityCard from "../components/OpportunityCard";

export default function Opportunities() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Filters and sorting state
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formError, setFormError] = useState("");

    // Form fields
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [jobLevel, setJobLevel] = useState("");
    const [status, setStatus] = useState("SAVED");
    const [source, setSource] = useState("MANUAL");
    const [jobUrl, setJobUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [appliedAt, setAppliedAt] = useState("");

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search change
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // React Query loaders
    const { data: enums } = useQuery<BackendEnums>({
        queryKey: ["enums"],
        queryFn: getBackendEnums,
    });

    const { data: companiesData } = useQuery({
        queryKey: ["companies", "", 1],
        queryFn: () => getCompanies("", 1, 100),
    });

    const { data: oppsData, isLoading } = useQuery({
        queryKey: [
            "opportunities",
            debouncedSearch,
            filterStatus,
            filterLevel,
            startDate,
            endDate,
            sortBy,
            sortOrder,
            page,
        ],
        queryFn: () =>
            getOpportunities({
                search: debouncedSearch || undefined,
                status: filterStatus || undefined,
                jobLevel: filterLevel || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortBy: sortBy || undefined,
                sortOrder: sortOrder || undefined,
                page,
                limit: 12,
            }),
    });

    const opportunities = oppsData?.items || [];
    const pagination = oppsData?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };
    const companies = companiesData?.items || [];

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filterStatus, filterLevel, startDate, endDate, sortBy, sortOrder]);

    // Set defaults when enums load
    useEffect(() => {
        if (enums) {
            if (enums.jobRoles.length > 0 && !jobRole) setJobRole(enums.jobRoles[0]);
            if (enums.jobLevels.length > 0 && !jobLevel) setJobLevel(enums.jobLevels[0]);
        }
    }, [enums]);

    // React Query mutations
    const createOpportunityMutation = useMutation({
        mutationFn: createOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunities"] });
            setIsAddModalOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            setFormError(error?.response?.data?.message || "Failed to create opportunity");
        },
    });

    const deleteOpportunityMutation = useMutation({
        mutationFn: deleteOpportunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["opportunities"] });
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message || "Failed to delete opportunity");
        },
    });

    const resetForm = () => {
        setSelectedCompanyId(companies[0]?._id || "");
        setJobRole(enums?.jobRoles[0] || "");
        setJobLevel(enums?.jobLevels[0] || "");
        setStatus("SAVED");
        setSource("MANUAL");
        setJobUrl("");
        setNotes("");
        setSelectedSkills([]);
        setAppliedAt("");
        setFormError("");
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const handleAddOpportunity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) {
            setFormError("Please select a company");
            return;
        }
        if (!jobRole) {
            setFormError("Please select a job role");
            return;
        }
        if (!jobLevel) {
            setFormError("Please select a job level");
            return;
        }

        createOpportunityMutation.mutate({
            companyId: selectedCompanyId,
            jobRole,
            jobLevel,
            status,
            source,
            jobUrl: jobUrl.trim() || undefined,
            notes: notes.trim() || undefined,
            requiredSkills: selectedSkills,
            appliedAt: appliedAt ? new Date(appliedAt).toISOString() : undefined,
        });
    };

    const handleDeleteOpportunity = (e: React.MouseEvent, id: string, role: string) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the opportunity for ${role}?`)) {
            deleteOpportunityMutation.mutate(id);
        }
    };

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter((s) => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const formatEnum = (str: string) => {
        if (!str) return "";
        return str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    return (
        <div>
            {/* Header & Main Search */}
            <div className="companies-header">
                <div className="search-wrapper">
                    <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search jobs by role..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Opportunity
                </button>
            </div>

            {/* Filter Panel */}
            <div style={styles.filterPanel}>
                <div style={styles.filterGrid}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Status</label>
                        <select
                            className="form-select"
                            style={styles.filterSelect}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {enums?.opportunityStatuses.map((stat) => (
                                <option key={stat} value={stat}>{stat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Level</label>
                        <select
                            className="form-select"
                            style={styles.filterSelect}
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            {enums?.jobLevels.map((lvl) => (
                                <option key={lvl} value={lvl}>{formatEnum(lvl)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Applied After</label>
                        <input
                            type="date"
                            className="form-input"
                            style={styles.filterSelect}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Applied Before</label>
                        <input
                            type="date"
                            className="form-input"
                            style={styles.filterSelect}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Sort By</label>
                        <select
                            className="form-select"
                            style={styles.filterSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="createdAt">Date Tracked</option>
                            <option value="appliedAt">Applied Date</option>
                            <option value="jobRole">Job Role</option>
                            <option value="status">Status</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={styles.filterLabel}>Order</label>
                        <select
                            className="form-select"
                            style={styles.filterSelect}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading && opportunities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading opportunities...</h2>
                </div>
            ) : opportunities.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💼</div>
                    <div className="empty-state-title">No Opportunities Found</div>
                    <div className="empty-state-description">
                        Try refining your filter criteria or log a new job opportunity.
                    </div>
                    {companies.length === 0 ? (
                        <button className="btn btn-primary" onClick={() => navigate("/company")}>
                            Create Company First
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleOpenAddModal}>
                            Add First Opportunity
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="opportunities-grid">
                        {opportunities.map((job) => (
                            <OpportunityCard
                                key={job._id}
                                job={job}
                                onNavigate={(id) => navigate(`/opportunities/${id}`)}
                                onDelete={handleDeleteOpportunity}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <span className="pagination-text">
                                Showing page {page} of {pagination.totalPages} ({pagination.total} total opportunities)
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
                                    disabled={page === pagination.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Opportunity Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Opportunity" size="lg">
                <form onSubmit={handleAddOpportunity}>
                    {formError && (
                        <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px", textAlign: "left" }}>
                            {formError}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Company *</label>
                        {companies.length === 0 ? (
                            <div style={{ color: "#f59e0b", fontSize: "14px", margin: "4px 0" }}>
                                No companies found. Please <span style={{ textDecoration: "underline", cursor: "pointer", color: "var(--accent)" }} onClick={() => navigate("/company")}>add a company</span> first.
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                required
                            >
                                <option value="">-- Select Company --</option>
                                {companies.map((c: Company) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {enums && (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Job Role *</label>
                                    <select
                                        className="form-select"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Role --</option>
                                        {enums.jobRoles.map((role) => (
                                            <option key={role} value={role}>
                                                {formatEnum(role)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Job Level *</label>
                                    <select
                                        className="form-select"
                                        value={jobLevel}
                                        onChange={(e) => setJobLevel(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select Level --</option>
                                        {enums.jobLevels.map((lvl) => (
                                            <option key={lvl} value={lvl}>
                                                {formatEnum(lvl)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Status *</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        required
                                    >
                                        {enums.opportunityStatuses.map((stat) => (
                                            <option key={stat} value={stat}>
                                                {stat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Source</label>
                                    <select
                                        className="form-select"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                    >
                                        {enums.opportunitySources.map((src) => (
                                            <option key={src} value={src}>
                                                {formatEnum(src)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label className="form-label">Job Posting URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://company.com/careers/job"
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Applied Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={appliedAt}
                                        onChange={(e) => setAppliedAt(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Reminders, salary info, referral details..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Required Skills</label>
                                <div className="skills-selector">
                                    <div className="skills-checkbox-grid">
                                        {enums.requiredSkills.map((skill) => (
                                            <label key={skill} className="skill-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSkills.includes(skill)}
                                                    onChange={() => toggleSkill(skill)}
                                                />
                                                {formatEnum(skill)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createOpportunityMutation.isPending || companies.length === 0}
                        >
                            {createOpportunityMutation.isPending ? "Adding..." : "Add Opportunity"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    filterPanel: {
        background: "rgba(244, 243, 236, 0.15)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "24px",
        textAlign: "left",
    },
    filterGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
    },
    filterLabel: {
        fontSize: "12px",
        marginBottom: "6px",
    },
    filterSelect: {
        padding: "6px 10px",
        fontSize: "14px",
        height: "38px",
    },
};
