import React, { useState } from 'react';
import { Button, Card, Typography, Space, Result } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './TestPage.css'; // Assuming you'll add CSS for animations

const { Title, Paragraph } = Typography;

// Updated questions with more items for the test
const questions = [
  {
    question: "How often have you felt little interest or pleasure in doing things?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3], // Points for each option
  },
  {
    question: "How often have you felt down, depressed, or hopeless?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often do you have trouble falling or staying asleep, or sleeping too much?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often have you felt tired or had little energy?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often have you experienced feelings of guilt or worthlessness?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often do you have trouble concentrating on things, such as reading or watching TV?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often do you move or speak slowly, or the opposite, are you so fidgety or restless that others notice?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
  {
    question: "How often have you thought that you would be better off dead, or of hurting yourself in some way?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    points: [0, 1, 2, 3],
  },
];

const TestPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswerChange = (answer, points) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;

    setAnswers(updatedAnswers);
    setScore(score + points);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Assessment at the end
  const getAssessment = () => {
    if (score <= 10) {
      return "You seem to have a low level of depression. Keep maintaining a positive outlook!";
    } else if (score <= 20) {
      return "You are showing signs of mild depression. Consider seeking support if you feel overwhelmed.";
    } else if (score <= 30) {
      return "You may be experiencing moderate depression. It could be helpful to talk to a professional.";
    } else {
      return "You may be experiencing severe depression. Please seek help from a mental health professional as soon as possible.";
    }
  };

  return (
    <div className="test-page">
      <Card className="test-card">
        <Title level={2} className="test-title">Depression Test</Title>
        <Paragraph className="test-description">
          Answer the following questions to assess your symptoms of depression.
        </Paragraph>

        {/* Animated Question Section */}
        {completed ? (
          <Result
            status="success"
            title="Test Completed"
            subTitle={`Your score: ${score} \n\nAssessment: ${getAssessment()}`}
          />
        ) : (
          <div className="question-container">
            <div className="question">
              <Title level={4}>{questions[currentQuestion].question}</Title>
            </div>
            <div className="options">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(option, questions[currentQuestion].points[index])}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {!completed && (
          <Space size="large">
            <Button 
              type="default" 
              icon={<LeftOutlined />} 
              onClick={prevQuestion} 
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <Button 
              type="primary" 
              icon={<RightOutlined />} 
              onClick={nextQuestion} 
              disabled={currentQuestion === questions.length - 1}
            >
              {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
            </Button>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default TestPage;
