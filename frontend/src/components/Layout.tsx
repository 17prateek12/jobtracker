import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSidebarStore } from "../store/useSidebarStore";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const isOpenMobile = useSidebarStore(state => state.isOpenMobile);
    const closeMobile = useSidebarStore(state => state.closeMobile);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            {isOpenMobile && (
                <div 
                    className="sidebar-overlay" 
                    onClick={closeMobile} 
                    aria-hidden="true"
                />
            )}
            <div className="main-content">
                <Navbar />
                <main className="content-body">
                    {children}
                </main>
            </div>
        </div>
    );
}
