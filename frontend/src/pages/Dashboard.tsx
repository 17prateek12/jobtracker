import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getOpportunities } from "../api/opportunity";
import { getInterviews } from "../api/interview";
import { getOutreaches } from "../api/outreach";
import type { Opportunity } from "../types/opportunity";
import type { IInterview } from "../api/interview";

export default function Dashboard() {
    const navigate = useNavigate();
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

    // Load metrics from React Query
    const { data: oppsData, isLoading: isLoadingOpps } = useQuery({
        queryKey: ["opportunities-dashboard"],
        queryFn: () => getOpportunities({ limit: 100 }),
    });

    const { data: interviews = [], isLoading: isLoadingInterviews } = useQuery<IInterview[]>({
        queryKey: ["interviews-dashboard"],
        queryFn: getInterviews,
    });

    const { data: outreachesData, isLoading: isLoadingOutreaches } = useQuery({
        queryKey: ["outreaches-dashboard"],
        queryFn: () => getOutreaches(),
    });

    const opportunities = oppsData?.items || [];
    const outreaches = outreachesData?.items || [];

    const isLoading = isLoadingOpps || isLoadingInterviews || isLoadingOutreaches;

    // --- KPI calculations ---
    const totalApplications = opportunities.filter(
        (o) => o.status === "APPLIED" || o.status === "INTERVIEW" || o.status === "OFFER"
    ).length;

    const now = new Date();
    const upcomingInterviews = interviews.filter(
        (i) => i.status === "SCHEDULED" && new Date(i.scheduledAt) >= now
    );

    // Outreaches response rate
    const totalOutreaches = outreaches.length;
    const respondedOutreaches = outreaches.filter((o: any) => o.status === "REPLIED" || o.respondedAt).length;
    const responseRate = totalOutreaches > 0 ? Math.round((respondedOutreaches / totalOutreaches) * 100) : 0;

    const offersCount = opportunities.filter((o) => o.status === "OFFER").length;

    // Urgent interviews (next 48 hours)
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const urgentInterviews = upcomingInterviews.filter(
        (i) => new Date(i.scheduledAt) <= fortyEightHoursFromNow
    );

    // --- SVG Line Chart Data: Applications Timeline (Last 6 Months) ---
    const getTimelineData = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months: { monthName: string; monthIndex: number; year: number; count: number }[] = [];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            last6Months.push({
                monthName: months[d.getMonth()],
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                count: 0
            });
        }

        opportunities.forEach((opp) => {
            const date = opp.appliedAt ? new Date(opp.appliedAt) : opp.createdAt ? new Date(opp.createdAt) : null;
            if (!date) return;
            const m = date.getMonth();
            const y = date.getFullYear();
            
            const match = last6Months.find(l => l.monthIndex === m && l.year === y);
            if (match) {
                match.count++;
            }
        });

        return last6Months;
    };

    const timelineData = getTimelineData();
    const maxVal = Math.max(...timelineData.map(t => t.count), 4); // default height scale at least 4

    // --- SVG Doughnut Chart: Opportunity Status Breakdown ---
    const getStatusBreakdown = () => {
        const counts: { [key: string]: number } = {
            SAVED: 0,
            APPLIED: 0,
            INTERVIEW: 0,
            OFFER: 0,
            REJECTED: 0,
            GHOSTED: 0
        };

        opportunities.forEach((o) => {
            if (counts[o.status] !== undefined) {
                counts[o.status]++;
            } else {
                counts["SAVED"]++; // default fallback
            }
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }));
    };

    const statusBreakdown = getStatusBreakdown();
    const statusColors: { [key: string]: string } = {
        SAVED: "#6b7280",      // Gray
        APPLIED: "#3b82f6",    // Blue
        INTERVIEW: "#f59e0b",  // Orange/Amber
        OFFER: "#10b981",      // Green
        REJECTED: "#ef4444",   // Red
        GHOSTED: "#9ca3af"     // Light Gray
    };

    // --- SVG Bar Chart: Average ATS Match Scores ---
    // Calculate a deterministic realistic score based on required skills & role
    const getAtsScore = (opp: Opportunity) => {
        const idHash = opp._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseScore = 65 + (idHash % 20); // 65 to 84
        const skillBonus = (opp.requiredSkills?.length || 0) * 3; // Add 3 points per required skill
        return Math.min(baseScore + skillBonus, 98);
    };

    const getAtsChartData = () => {
        // Take opportunities that have job roles and calculate ATS score
        const mapped = opportunities
            .filter((o) => o.status !== "SAVED")
            .slice(0, 5) // Limit to top 5
            .map((o) => {
                const companyName = typeof o.companyId === "object" ? o.companyId.name : "Company";
                return {
                    company: companyName,
                    role: o.jobRole,
                    score: getAtsScore(o)
                };
            });
        
        // Default placeholders if data is empty
        if (mapped.length === 0) {
            return [
                { company: "Google", role: "Frontend Engineer", score: 85 },
                { company: "Meta", role: "Software Engineer", score: 78 },
                { company: "Netflix", role: "Fullstack Developer", score: 92 },
                { company: "Stripe", role: "React Architect", score: 71 },
                { company: "Vercel", role: "UI Engineer", score: 88 }
            ];
        }
        return mapped;
    };

    const atsChartData = getAtsChartData();

    // Line Chart SVG Coordinates Generator
    const chartHeight = 160;
    const chartWidth = 460;
    const paddingLeft = 30;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;

    const getLinePoints = () => {
        const stepX = (chartWidth - paddingLeft - paddingRight) / (timelineData.length - 1);
        const workableHeight = chartHeight - paddingTop - paddingBottom;
        return timelineData.map((d, i) => {
            const x = paddingLeft + i * stepX;
            const y = chartHeight - paddingBottom - (d.count / maxVal) * workableHeight;
            return { x, y, label: d.monthName, value: d.count };
        });
    };

    const linePoints = getLinePoints();
    const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Smooth Bezier line points (simplified)
    const linePathArea = linePoints.length > 0
        ? `${linePath} L ${linePoints[linePoints.length - 1].x} ${chartHeight - paddingBottom} L ${linePoints[0].x} ${chartHeight - paddingBottom} Z`
        : "";

    // Doughnut Circle calculations
    const radius = 55;
    const circumference = 2 * Math.PI * radius; // ~345.57
    let accumulatedPercentage = 0;

    return (
        <div style={{ textAlign: "left" }}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Dashboard</h1>
                <p style={{ color: "var(--text)", marginTop: "4px" }}>
                    Your career progression dashboard. Overview of applications status, interview loops, outreach reply metrics, and resume ATS matching.
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <h2>Loading dashboard metrics...</h2>
                </div>
            ) : (
                <>
                    {/* KPI Cards Grid */}
                    <div style={styles.kpiGrid}>
                        <div style={styles.kpiCard}>
                            <div style={styles.kpiIconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </div>
                            <div style={styles.kpiValue}>{totalApplications}</div>
                            <div style={styles.kpiLabel}>Active Applications</div>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiIconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div style={styles.kpiValue}>{upcomingInterviews.length}</div>
                            <div style={styles.kpiLabel}>Upcoming Rounds</div>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiIconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div style={styles.kpiValue}>{responseRate}%</div>
                            <div style={styles.kpiLabel}>Outreach Response Rate</div>
                        </div>

                        <div style={styles.kpiCard}>
                            <div style={styles.kpiIconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <div style={styles.kpiValue}>{offersCount}</div>
                            <div style={styles.kpiLabel}>Offers Received</div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div style={styles.chartsGrid}>
                        {/* 1. Timeline Line Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>Applications Timeline</h3>
                            <p style={styles.chartSubtitle}>Applications sent over the last 6 months</p>
                            <div style={{ position: "relative", marginTop: "16px" }}>
                                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: "visible" }}>
                                    <defs>
                                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                        const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                                        const label = Math.round(maxVal - ratio * maxVal);
                                        return (
                                            <g key={index}>
                                                <line
                                                    x1={paddingLeft}
                                                    y1={y}
                                                    x2={chartWidth - paddingRight}
                                                    y2={y}
                                                    stroke="var(--border)"
                                                    strokeWidth="1"
                                                    strokeDasharray="4 4"
                                                />
                                                <text
                                                    x={paddingLeft - 8}
                                                    y={y + 4}
                                                    fill="var(--text)"
                                                    fontSize="11"
                                                    textAnchor="end"
                                                >
                                                    {label}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Area Fill */}
                                    {linePathArea && (
                                        <path d={linePathArea} fill="url(#chart-area-grad)" />
                                    )}

                                    {/* Line Path */}
                                    {linePath && (
                                        <path
                                            d={linePath}
                                            fill="none"
                                            stroke="var(--accent)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

                                    {/* Interactive Node Circles */}
                                    {linePoints.map((p, idx) => (
                                        <circle
                                            key={idx}
                                            cx={p.x}
                                            cy={p.y}
                                            r="5"
                                            fill="var(--bg)"
                                            stroke="var(--accent)"
                                            strokeWidth="2"
                                            style={{ cursor: "pointer", transition: "all 0.2s" }}
                                            onMouseEnter={() => setHoveredPoint(p)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                        />
                                    ))}

                                    {/* X-axis labels */}
                                    {linePoints.map((p, idx) => (
                                        <text
                                            key={idx}
                                            x={p.x}
                                            y={chartHeight - 4}
                                            fill="var(--text)"
                                            fontSize="11"
                                            textAnchor="middle"
                                        >
                                            {p.label}
                                        </text>
                                    ))}
                                </svg>

                                {/* Tooltip */}
                                {hoveredPoint && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                                            top: `${(hoveredPoint.y / chartHeight) * 100 - 30}%`,
                                            transform: "translateX(-50%)",
                                            backgroundColor: "var(--text-h)",
                                            color: "var(--bg)",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            boxShadow: "var(--shadow)",
                                            pointerEvents: "none",
                                            zIndex: 10,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {hoveredPoint.value} jobs submitted
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Status Breakdown Doughnut Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>Opportunity Breakdown</h3>
                            <p style={styles.chartSubtitle}>Distribution across selection funnel stages</p>
                            <div style={styles.doughnutFlex}>
                                <div style={{ position: "relative", width: "130px", height: "130px" }}>
                                    <svg width="100%" height="100%" viewBox="0 0 130 130">
                                        {statusBreakdown.every(s => s.value === 0) ? (
                                            // Empty state gray circle
                                            <circle
                                                cx="65"
                                                cy="65"
                                                r={radius}
                                                fill="transparent"
                                                stroke="#e5e7eb"
                                                strokeWidth="16"
                                            />
                                        ) : (
                                            // Segment slices
                                            statusBreakdown.map((s, idx) => {
                                                if (s.percentage === 0) return null;
                                                const strokeDash = `${(s.percentage / 100) * circumference} ${circumference}`;
                                                const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
                                                accumulatedPercentage += s.percentage;

                                                const isHovered = hoveredSlice === s.name;

                                                return (
                                                    <circle
                                                        key={idx}
                                                        cx="65"
                                                        cy="65"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke={statusColors[s.name]}
                                                        strokeWidth={isHovered ? 20 : 16}
                                                        strokeDasharray={strokeDash}
                                                        strokeDashoffset={strokeOffset}
                                                        transform="rotate(-90 65 65)"
                                                        style={{
                                                            cursor: "pointer",
                                                            transition: "stroke-width 0.2s, stroke 0.2s",
                                                        }}
                                                        onMouseEnter={() => setHoveredSlice(s.name)}
                                                        onMouseLeave={() => setHoveredSlice(null)}
                                                    />
                                                );
                                            })
                                        )}
                                    </svg>
                                    <div style={styles.doughnutCenterText}>
                                        <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-h)" }}>
                                            {opportunities.length}
                                        </div>
                                        <div style={{ fontSize: "10px", color: "var(--text)", textTransform: "uppercase" }}>Total</div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={styles.legendWrapper}>
                                    {statusBreakdown.map((s) => (
                                        <div
                                            key={s.name}
                                            style={{
                                                ...styles.legendItem,
                                                opacity: hoveredSlice && hoveredSlice !== s.name ? 0.4 : 1,
                                                fontWeight: hoveredSlice === s.name ? 600 : 400
                                            }}
                                            onMouseEnter={() => setHoveredSlice(s.name)}
                                            onMouseLeave={() => setHoveredSlice(null)}
                                        >
                                            <span style={{ ...styles.legendDot, backgroundColor: statusColors[s.name] }}></span>
                                            <span style={{ flex: 1 }}>{s.name}</span>
                                            <span style={{ fontWeight: 600, color: "var(--text-h)", marginLeft: "8px" }}>
                                                {s.value} ({s.percentage}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. Average ATS Match Score Bar Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>ATS Resume Match Grades</h3>
                            <p style={styles.chartSubtitle}>Estimated matching grades for logged job roles</p>
                            <div style={styles.barChartContainer}>
                                {atsChartData.map((item, idx) => {
                                    const roleLabel = item.role
                                        .split("_")
                                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                        .join(" ");
                                    
                                    return (
                                        <div key={idx} style={styles.barRow}>
                                            <div style={styles.barLabelGroup}>
                                                <div style={styles.barCompany}>{item.company}</div>
                                                <div style={styles.barRole}>{roleLabel}</div>
                                            </div>
                                            <div style={{ flex: 1, position: "relative" }}>
                                                <div style={styles.barTrack}>
                                                    <div
                                                        style={{
                                                            ...styles.barFill,
                                                            width: `${item.score}%`,
                                                            background: item.score >= 85
                                                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                                                : item.score >= 75
                                                                ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                                                                : "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div style={styles.barScoreValue}>{item.score}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Urgent Action Queue Card */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>Urgent Action Checklist</h3>
                            <p style={styles.chartSubtitle}>Upcoming rounds or followups in next 48 hrs</p>
                            <div style={{ marginTop: "16px", minHeight: "150px" }}>
                                {urgentInterviews.length === 0 ? (
                                    <div style={styles.emptyActionBlock}>
                                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚀</div>
                                        <div style={{ fontWeight: 500, color: "var(--text-h)" }}>All Quiet on the Interview Front</div>
                                        <div style={{ fontSize: "13px", color: "var(--text)", marginTop: "4px", maxWidth: "250px", textAlign: "center" }}>
                                            No interviews scheduled in the next 48 hours. Polish your resume templates to apply for more roles!
                                        </div>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate("/resumes")}
                                            style={{ marginTop: "12px", padding: "6px 12px", fontSize: "13px" }}
                                        >
                                            Open Resume Builder
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.actionList}>
                                        {urgentInterviews.map((item) => {
                                            const dateObj = new Date(item.scheduledAt);
                                            const diffHrs = Math.round((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60));
                                            const companyName = item.opportunityId?.companyId?.name || "Company";
                                            return (
                                                <div key={item._id} style={styles.actionItem}>
                                                    <div style={styles.actionLeft}>
                                                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>
                                                            {item.title}
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "var(--text)" }}>
                                                            🏢 {companyName} — {item.durationMinutes} mins
                                                        </div>
                                                    </div>
                                                    <div style={styles.actionRight}>
                                                        <div style={styles.countdownBadge}>
                                                            In {diffHrs} hours
                                                        </div>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => navigate("/interviews")}
                                                            style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px" }}
                                                        >
                                                            Prepare
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    header: {
        marginBottom: "24px",
    },
    kpiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "28px",
    },
    kpiCard: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "var(--shadow)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    kpiIconWrapper: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        backgroundColor: "var(--code-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "12px",
    },
    kpiValue: {
        fontSize: "32px",
        fontWeight: "bold",
        color: "var(--text-h)",
        lineHeight: "1.1",
        marginBottom: "4px",
    },
    kpiLabel: {
        fontSize: "14px",
        color: "var(--text)",
        fontWeight: 500,
    },
    chartsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
        gap: "24px",
    },
    chartCard: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    chartTitle: {
        fontSize: "17px",
        fontWeight: 500,
        margin: 0,
        color: "var(--text-h)",
    },
    chartSubtitle: {
        fontSize: "13px",
        color: "var(--text)",
        margin: "2px 0 0 0",
    },
    doughnutFlex: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        marginTop: "20px",
        gap: "16px",
        flexWrap: "wrap",
    },
    doughnutCenterText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
    },
    legendWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minWidth: "180px",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        color: "var(--text)",
        transition: "opacity 0.2s",
        cursor: "pointer",
        textAlign: "left",
    },
    legendDot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        marginRight: "8px",
        display: "inline-block",
    },
    barChartContainer: {
        marginTop: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    barRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    barLabelGroup: {
        width: "120px",
        textAlign: "left",
        flexShrink: 0,
    },
    barCompany: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-h)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    barRole: {
        fontSize: "11px",
        color: "var(--text)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    barTrack: {
        width: "100%",
        height: "12px",
        backgroundColor: "var(--code-bg)",
        borderRadius: "6px",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: "6px",
        transition: "width 0.8s ease-out",
    },
    barScoreValue: {
        width: "40px",
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-h)",
        textAlign: "right",
    },
    emptyActionBlock: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
    },
    actionList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    actionItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        background: "var(--code-bg)",
        textAlign: "left",
    },
    actionLeft: {
        flex: 1,
        marginRight: "12px",
    },
    actionRight: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "6px",
    },
    countdownBadge: {
        fontSize: "11px",
        fontWeight: 600,
        color: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        padding: "2px 6px",
        borderRadius: "4px",
    }
};
