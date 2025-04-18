import React, { useState } from "react";
import { Collapse, Input, Button, Tooltip, message, Pagination } from "antd";
import { motion } from "framer-motion";
import {
  QuestionCircleOutlined,
  SearchOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import "./FAQSection.css";
import photo5 from "../assets/images/photo_5.jpg"
import img2 from "../assets/images/photo_6.jpg"
const { Panel } = Collapse;

 const faqsData = [
  {
    id: 1,
    question: "What is Sentio?",
    answer: "Sentio is your AI-powered emotional wellness companion—ready 24/7 to listen, support, and guide you through life’s ups and downs."
  },
  {
    id: 2,
    question: "How does Sentio detect how I’m feeling?",
    answer: "It combines natural language understanding, live facial emotion recognition to understand your emotional state in real time."
  },
  {
    id: 3,
    question: "Which AI models power Sentio?",
    answer: "Sentio uses a hybrid of a Retrieval-Augmented Generation (RAG) model and Gemini LLM to provide empathetic and context-aware responses."
  },
  {
    id: 4,
    question: "How can I talk to Sentio?",
    answer: "You can speak to Sentio using your voice or type messages—it adapts to your comfort level."
  },
  {
    id: 5,
    question: "Can Sentio speak back to me?",
    answer: "Absolutely! Sentio responds through both voice and text so you can choose how you want to interact."
  },
  {
    id: 6,
    question: "Is my data safe with Sentio?",
    answer: "Yes. All data is end-to-end encrypted and never shared without your consent. Your privacy is a top priority."
  },
  {
    id: 7,
    question: "Will Sentio alert someone if I’m in distress?",
    answer: "Yes. If high emotional distress is detected, Sentio gently suggests professional help or offers to connect you to a therapist or helpline."
  },
  {
    id: 8,
    question: "Is Sentio a therapist?",
    answer: "No. Sentio is not a licensed therapist but offers emotional support and can refer you to certified professionals when needed."
  },
  {
    id: 9,
    question: "Can I view and manage my chat history?",
    answer: "Yes. Your chats are stored securely for personalization. You can view or delete them anytime."
  },
  {
    id: 10,
    question: "Do I need to create an account?",
    answer: "Yes, creating an account helps personalize your experience and keeps your data secure and private."
  },
  {
    id: 11,
    question: "Does Sentio support multiple languages?",
    answer: "Currently, Sentio speaks English, but multilingual support is on the roadmap."
  },
  {
    id: 12,
    question: "How does Sentio improve over time?",
    answer: "Sentio uses feedback loops and your emotional trends to continuously become more empathetic and accurate—without compromising your privacy."
  },
  {
    id: 13,
    question: "Can I connect Sentio with other apps?",
    answer: "Integrations are being developed! For now, Sentio runs as a standalone web and mobile app."
  },
  {
    id: 14,
    question: "What makes Sentio different from other chatbots?",
    answer: "Sentio uniquely blends deep emotional AI, distress detection, facial analysis, and real voice calling support to truly care, not just respond."
  },
  {
    id: 15,
    question: "Can Sentio help in emergencies?",
    answer: "Yes. Sentio can trigger emergency voice calls via Twilio when you're in immediate need of help."
  },
];


const Faq = () => {
  const [faqs, setFaqs] = useState(faqsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of FAQs per page

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Filtered FAQs based on search input
  const filteredFaqs = faqs?.filter((faq) =>
    faq?.question?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Paginate FAQs
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFaqs = filteredFaqs.slice(startIndex, startIndex + pageSize);

  // Handle pagination change
  const handlePageChange = (page) => setCurrentPage(page);

  // Handle feedback (Like/Dislike)
  const handleFeedback = (id, type) => {
    setFeedback((prev) => ({
      ...prev,
      [id]: type,
    }));
    message.success(`You ${type === "like" ? "liked" : "disliked"} this FAQ!`);
  };
 
    return (
        <section>
           <div className="text-center">
  <p className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
    <span className="text-[#f64a8a]">GOT QUESTIONS? WE'VE </span> 
    <span className="text-[#5CE0E6]">GOT ANSWERS  </span>
  </p>
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold pt-8 pb-6" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
    <span className="text-[#5CE0E6] mx-auto">FREQUENTLY ASKED QUESTIONS </span>
  </h1>
</div>
          <motion.div
            className="faq-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Add the image here */}
            <img
  src={photo5}
  alt="FAQ Illustration"
  className="faq-overlap-image hidden md:hidden lg:block"
/>

<h2 className="faq-title">
              <QuestionCircleOutlined /> Search Your Queries
            </h2>
            
    
            {/* Search Bar */}
            <Input
              className="faq-search"
              placeholder="Search FAQs..."
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            />
    
            {/* FAQ Accordion */}
            <Collapse accordion className="faq-collapse">
              {paginatedFaqs.length > 0 ? (
                paginatedFaqs.map((faq) => (
                  <Panel header={faq.question} key={faq.id} className="faq-panel">
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {faq.answer}
                    </motion.p>
    
                    {/* Feedback Buttons */}
                    <div className="faq-feedback">
                      <Tooltip title="Helpful">
                        <Button
                          type={feedback[faq.id] === "like" ? "primary" : "default"}
                          shape="circle"
                          icon={<LikeOutlined />}
                          onClick={() => handleFeedback(faq.id, "like")}
                        />
                      </Tooltip>
                      <Tooltip title="Not Helpful">
                        <Button
                          type={feedback[faq.id] === "dislike" ? "primary" : "default"}
                          shape="circle"
                          icon={<DislikeOutlined />}
                          onClick={() => handleFeedback(faq.id, "dislike")}
                        />
                      </Tooltip>
                    </div>
                  </Panel>
                ))
              ) : (
                <p className="no-results">No FAQs found for "{searchTerm}"</p>
              )}
            </Collapse>
    
            {/* Pagination */}
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredFaqs.length}
              onChange={handlePageChange}
              className="faq-pagination"
            />
          </motion.div>
        </section>
      );
    };
    
    export default Faq;