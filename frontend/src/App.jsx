// import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import DocumentViewer from "@/pages/DocumentViewer";
import Search from "@/pages/Search";
import Assistant from "@/pages/Assistant";
import KnowledgeGraph from "@/pages/KnowledgeGraph";
import Maintenance from "@/pages/Maintenance";
import Profile from "@/pages/Profile";

function Shell({ children }) {
    return (
        <ProtectedRoute>
            <AppShell>{children}</AppShell>
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: "#141824", border: "1px solid #232B3B", color: "#F8FAFC", borderRadius: 2, fontFamily: "IBM Plex Mono" } }} />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
                        <Route path="/documents" element={<Shell><Documents /></Shell>} />
                        <Route path="/documents/:id" element={<Shell><DocumentViewer /></Shell>} />
                        <Route path="/search" element={<Shell><Search /></Shell>} />
                        <Route path="/assistant" element={<Shell><Assistant /></Shell>} />
                        <Route path="/graph" element={<Shell><KnowledgeGraph /></Shell>} />
                        <Route path="/maintenance" element={<Shell><Maintenance /></Shell>} />
                        <Route path="/profile" element={<Shell><Profile /></Shell>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}
