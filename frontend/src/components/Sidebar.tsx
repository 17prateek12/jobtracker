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
            </nav>
        </aside>
    );
}
