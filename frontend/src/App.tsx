import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { getCurrentUser } from "./api/auth";

import Login from "./pages/Login";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import OpportunityDetail from "./pages/OpportunityDetail";
import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import Templates from "./pages/Templates";
import Resumes from "./pages/Resumes";
import ResumeBuilder from "./pages/ResumeBuilder";
import Interviews from "./pages/Interviews";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const initializeTheme = useThemeStore((state) => state.initializeTheme);

    useEffect(() => {
        initializeAuth();
        initializeTheme();

        const token = useAuthStore.getState().token;
        if (token) {
            getCurrentUser()
                .then((freshUser) => {
                    useAuthStore.setState({ user: freshUser });
                    localStorage.setItem("user", JSON.stringify(freshUser));
                })
                .catch((err) => {
                    console.error("Failed to hydrate auth state:", err);
                });
        }
    }, [initializeAuth, initializeTheme]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/opportunities"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Opportunities />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/companies"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Companies />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/company"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Companies />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/companies/:companyId"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CompanyDetail />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/opportunities/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <OpportunityDetail />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/templates"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Templates />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resumes"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Resumes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resumes/builder"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ResumeBuilder />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resumes/builder/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ResumeBuilder />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/interviews"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Interviews />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}