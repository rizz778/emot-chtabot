import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import BuyToken from "./pages/BuyToken";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import "regenerator-runtime/runtime";
import Navbar from "./components/Navbar";
import TestPage from "./components/TestPage.jsx";
import About2 from "./pages/About2.jsx";
import AvatarExperience from "./pages/AvatarExperience";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Resource from "./pages/Resource.jsx";
import Helpline from "./pages/Helpline.jsx";
import SelfAssessment from "./pages/SelfAssessment.jsx";
import Therapists from "./pages/Therapists.jsx";
import RelaxationToolsPage from "./pages/RelaxationToolsPage.jsx";
import CommunityForum from "./pages/CommunityForum.jsx";
import TherapistBookingPage from "./pages/TherapistBookingPage.jsx";
import TabPage from "./pages/TabPage.jsx";
import TwoTabPage from "./pages/TwoTabPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import Dashboard from "./components/Dashboard.jsx"
function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  // Apply the gradient background if on /token page
  useEffect(() => {
    if (location.pathname === "/token") {
      document.body.style.backgroundColor = " #ff92be";
    } else {
      document.body.style.background = ""; // Reset to default
    }
  }, [location]);

  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/chat" /> : <Signup />} />
        <Route path="/resource" element={<Resource />} />
        <Route path="/about" element={<About2 />} />

        {/* Protected Routes */}
        <Route path="/token" element={isAuthenticated ? <BuyToken /> : <Navigate to="/login" />} />
        <Route path="/avatarexp" element={isAuthenticated ? <AvatarExperience /> : <Navigate to="/login" />} />
        <Route path="/helpline" element={isAuthenticated ? <Helpline /> : <Navigate to="/login" />} />
        <Route path="/selfassessment" element={isAuthenticated ? <SelfAssessment /> : <Navigate to="/login" />} />
        <Route path="/test/depression" element={isAuthenticated ? <TestPage /> : <Navigate to="/login" />} />
        <Route path="/therapists" element={isAuthenticated ? <Therapists /> : <Navigate to="/login" />} />
        <Route path="/therapist_booking" element={isAuthenticated ? <TherapistBookingPage /> : <Navigate to="/login" />} />
        <Route path="/relaxationtools" element={isAuthenticated ? <RelaxationToolsPage /> : <Navigate to="/login" />} />
        <Route path="/communityforum" element={isAuthenticated ? <CommunityForum /> : <Navigate to="/login" />} />
        <Route path="/tabpage" element={isAuthenticated ? <TabPage /> : <Navigate to="/login" />} />
        <Route path="/twotabpage" element={isAuthenticated ? <TwoTabPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/dashboard" />} />

      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
