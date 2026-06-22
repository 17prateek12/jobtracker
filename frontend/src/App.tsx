import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import OpportunityDetail from "./pages/OpportunityDetail";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/companies"
                    element={
                        <ProtectedRoute>
                            <Companies />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/companies/:companyId"
                    element={
                        <ProtectedRoute>
                            <CompanyDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/opportunities/:id"
                    element={
                        <ProtectedRoute>
                            <OpportunityDetail />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}