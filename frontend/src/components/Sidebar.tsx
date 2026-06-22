import { Link, useLocation } from "react-router-dom";
import { useSidebarStore } from "../store/useSidebarStore";

export default function Sidebar() {
    const location = useLocation();
    const isCollapsed = useSidebarStore(state => state.isCollapsed);
    const isOpenMobile = useSidebarStore(state => state.isOpenMobile);
    const closeMobile = useSidebarStore(state => state.closeMobile);

    const isDashboardActive = location.pathname === "/dashboard";
    const isCompaniesActive = 
        location.pathname === "/companies" || 
        location.pathname === "/company" || 
        location.pathname.startsWith("/companies/") || 
        location.pathname.startsWith("/company/");

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : "expanded"} ${isOpenMobile ? "mobile-open" : ""}`}>
            <div className="sidebar-logo">
                <span>{isCollapsed ? "JT" : "💼 Job Tracker"}</span>
            </div>
            <nav className="sidebar-menu">
                <Link 
                    to="/dashboard" 
                    className={`sidebar-link ${isDashboardActive ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="9" />
                            <rect x="14" y="3" width="7" height="5" />
                            <rect x="14" y="12" width="7" height="9" />
                            <rect x="3" y="16" width="7" height="5" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Dashboard</span>
                </Link>
                <Link 
                    to="/company" 
                    className={`sidebar-link ${isCompaniesActive ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                            <path d="M9 7h6" />
                            <path d="M9 11h6" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Companies</span>
                </Link>
                <Link 
                    to="/opportunities" 
                    className={`sidebar-link ${location.pathname === "/opportunities" || location.pathname.startsWith("/opportunities/") ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Opportunities</span>
                </Link>
                <Link 
                    to="/templates" 
                    className={`sidebar-link ${location.pathname === "/templates" || location.pathname.startsWith("/templates/") ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Templates</span>
                </Link>
                <Link 
                    to="/resumes" 
                    className={`sidebar-link ${location.pathname === "/resumes" || location.pathname.startsWith("/resumes/") ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <circle cx="10" cy="13" r="2" />
                            <path d="M14 17a4 4 0 0 0-8 0" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Resumes</span>
                </Link>
                <Link 
                    to="/interviews" 
                    className={`sidebar-link ${location.pathname === "/interviews" || location.pathname.startsWith("/interviews/") ? "active" : ""}`}
                    onClick={closeMobile}
                >
                    <div className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <span className="sidebar-label">Interviews</span>
                </Link>
            </nav>
        </aside>
    );
}
