import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import BuyToken from "./pages/BuyToken";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import PrivateRoute from "./routes/PrivateRoute";
import "regenerator-runtime/runtime";
import Navbar from "./components/Navbar";
import TestPage from "./components/TestPage.jsx";
import About from "./pages/About";
import AvatarExperience from "./pages/AvatarExperience";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Resource from "./pages/Resource.jsx";
import Helpline from "./pages/Helpline.jsx";
import SelfAssessment from "./pages/SelfAssessment.jsx";
import Therapists from "./pages/Therapists.jsx";
import RelaxationToolsPage from "./pages/RelaxationToolsPage.jsx";
import CommunityForum from "./pages/CommunityForum.jsx";
import TherapistBookingPage from "./pages/TherapistBookingPage.jsx";
import TabPage from "./pages/TabPage.jsx";
import About2 from "./pages/About2.jsx";
import TwoTabPage from "./pages/TwoTabPage.jsx";
import ChatPage from "./pages/ChatPage";
import PrivateRoute from "./routes/PrivateRoute";

import { Navigate } from "react-router-dom";
function App() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  // Apply the gradient background if on /token page
  useEffect(() => {
    if (location.pathname === '/token') {
      document.body.style.backgroundColor = ' #ff92be';
    } else {
      document.body.style.background = ''; // Reset to default
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
        <Route path="/token" element={<BuyToken />} />
        <Route path="/about" element={<About2 />} />
        <Route path="/avatarexp" element={<AvatarExperience />} />
        <Route path="/resource" element={<Resource />} />
        <Route path="/helpline" element={<Helpline />} />
        <Route path="/selfassessment" element={<SelfAssessment />} />
        <Route path="/test/depression" element={<TestPage />} />
        <Route path="/therapists" element={<Therapists />} />
        <Route path="/therapist_booking" element={<TherapistBookingPage />} />
        <Route path="/relaxationtools" element={<RelaxationToolsPage />} />
        <Route path="/communityforum" element={<CommunityForum />} />
        <Route path="/tabpage" element={<TabPage />} />
        <Route path="/twotabpage" element={<TwoTabPage />} />
        <Route path="/chat" element={<ChatPage />} />
        
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
