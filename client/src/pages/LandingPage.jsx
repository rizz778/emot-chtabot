import React from "react";
import { Button, Card } from "antd";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar">
        <motion.div 
          className="navbar-logo"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          AI Virtual Counselor
        </motion.div>
        <motion.div 
          className="navbar-buttons"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/login">
            <Button type="primary" className="nav-button">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="nav-button">Sign Up</Button>
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="hero-title"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Sentio : Your Companion for Emotional Well-being
        </motion.h1>
        <motion.p 
          className="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Empowering you with personalized emotional support, anytime, anywhere.
        </motion.p>
        <motion.div 
          className="hero-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
           <Link to="/chat">
            <Button type="primary" className="hero-button">
              Get Started
            </Button>
          </Link>
          <Link to="/token">
            <Button className="hero-button">
              Buy Tokens
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Cards Section */}
      <section className="features">
        <h2 className="features-title">Why Choose Us?</h2>
        <motion.div 
          className="features-cards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="feature-card" title="Empathetic Support" bordered={false}>
              AI-driven emotional understanding to provide tailored responses.
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="feature-card" title="Accessible 24/7" bordered={false}>
              Always available to assist you with your emotional needs.
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card className="feature-card" title="Personalized Guidance" bordered={false}>
              Unique recommendations based on your emotional patterns.
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          &copy; 2025 AI Virtual Counselor. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
};

export default LandingPage;
