import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import BuyToken from "./pages/BuyToken";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import PrivateRoute from "./routes/PrivateRoute";
import "regenerator-runtime/runtime";
import Navbar from "./components/Navbar"
import About from "./pages/About"
import './App.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<PrivateRoute component={ChatPage} />} />
        <Route path="/token" element={<BuyToken />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
