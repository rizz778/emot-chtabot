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
  { id: 1, question: "What is Sentio?", answer: "Sentio, your AI Virtual Counselor, provides emotional support through AI-driven conversations." },
  { id: 2, question: "How does the chatbot understand emotions?", answer: "It uses NLP, speech emotion recognition, and sentiment analysis to interpret user emotions." },
  { id: 3, question: "Does the chatbot use a specific AI model?", answer: "Yes, it leverages a RAG model along with Google's Gemini LLM for responses." },
  { id: 4, question: "What input methods are supported?", answer: "You can interact via both **voice and text** inputs." },
  { id: 5, question: "Does the chatbot support voice output?", answer: "Yes, Sentio provides both **text and voice-based** responses." },
  { id: 6, question: "How does speech emotion recognition work?", answer: "It analyzes tone, pitch, and variations in speech to detect emotions." },
  { id: 7, question: "Are my conversations stored?", answer: "Yes, chat history is securely stored for personalization. You can delete your chats anytime." },
  { id: 8, question: "Is my personal data safe?", answer: "Absolutely! We use **end-to-end encryption** and strict privacy policies." },
  { id: 9, question: "Can the chatbot provide professional counseling?", answer: "It offers emotional support but is **not a replacement for therapy**. It can recommend professionals if needed." },
  { id: 10, question: "Do I need an account to use Sentio?", answer: "Yes, authentication ensures **personalized experiences** and data security." },
  { id: 11, question: "Does the chatbot support multiple languages?", answer: "Currently, Sentio primarily interacts in **English**, with multilingual support planned for future updates." },
  { id: 12, question: "Can I access my chat history?", answer: "Yes! Your history is stored securely, and you can review or delete conversations anytime." },
  { id: 13, question: "How does the chatbot provide responses?", answer: "It uses **retrieval-based methods (RAG) + generative AI (LLM - Gemini)** for accurate, empathetic replies." },
  { id: 14, question: "Will Sentio improve over time?", answer: "Yes! The chatbot **learns from interactions** while maintaining ethical AI principles and privacy." },
  { id: 15, question: "Can I integrate the chatbot with other platforms?", answer: "Integrations are in progress, but currently, Sentio is a standalone application." },
  { id: 16, question: "Does the chatbot detect mental health risks?", answer: "It can identify distress patterns but **is not a diagnostic tool**. If needed, it recommends professional help." },
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
          <div className="head-p">
            <span style={{ paddingRight: "5px", color: "#ffc0cb" }}>GOT QUESTIONS?WE'VE </span>
            <span style={{ color: "#5CE0E6" }}> GOT ANSWERS  </span>
          </div>
          <div className="head">FREQUENTLY ASKED QUESTIONS</div>
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
              className="faq-overlap-image"
            />
    
            <h2 className="faq-title">
              <QuestionCircleOutlined /> Frequently Asked Questions
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