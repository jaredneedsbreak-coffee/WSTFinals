import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProposal from "./pages/AdminProposal";
import Users from "./pages/Users";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ProposalReview from "./pages/ProposalReview";
import SubmissionStatus from "./pages/SubmissionStatus";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/proposals" element={<AdminProposal />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/reviewer" element={<ReviewerDashboard />} />
      <Route path="/reviewer/proposals" element={<ProposalReview />} />
      <Route path="/submission-status" element={<SubmissionStatus />} />
      <Route path="/proposal-review" element={<ProposalReview />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWithSync />
    </Router>
  );
}

function AppWithSync() {
  // With session-based auth, we don't need complex token syncing
  // Sessions are handled automatically by the browser and backend
  return <AppRoutes />;
}

export default App;
