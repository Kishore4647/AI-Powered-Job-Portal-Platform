import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Profile from "./pages/candidate/Profile";
import JobsList from "./pages/candidate/JobsList";
import JobDetail from "./pages/candidate/JobDetail";
import MyApplications from "./pages/candidate/MyApplications";

import Company from "./pages/recruiter/Company";
import JobsManage from "./pages/recruiter/JobsManage";
import JobForm from "./pages/recruiter/JobForm";
import Applicants from "./pages/recruiter/Applicants";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "CANDIDATE" ? "/jobs" : "/recruiter/jobs"} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate routes */}
        <Route path="/jobs" element={<ProtectedRoute role="CANDIDATE"><JobsList /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute role="CANDIDATE"><JobDetail /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute role="CANDIDATE"><MyApplications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="CANDIDATE"><Profile /></ProtectedRoute>} />

        {/* Recruiter routes */}
        <Route path="/recruiter/company" element={<ProtectedRoute role="RECRUITER"><Company /></ProtectedRoute>} />
        <Route path="/recruiter/jobs" element={<ProtectedRoute role="RECRUITER"><JobsManage /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/new" element={<ProtectedRoute role="RECRUITER"><JobForm /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/:id/edit" element={<ProtectedRoute role="RECRUITER"><JobForm /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute role="RECRUITER"><Applicants /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
