import React, { useState } from 'react';
import { Button, Card, Typography, Space, Result, List } from 'antd';
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

// Personalized suggestions based on score ranges
const getSuggestions = (score) => {
  if (score <= 4) {
    return [
      "Continue maintaining your daily routine and healthy habits",
      "Practice gratitude journaling to maintain positive outlook",
      "Stay connected with your support network"
    ];
  } else if (score <= 9) {
    return [
      "Incorporate regular physical activity into your routine",
      "Practice mindfulness meditation for 10 minutes daily",
      "Ensure you're getting enough sleep and maintaining a consistent sleep schedule",
      "Consider talking to a trusted friend about how you're feeling"
    ];
  } else if (score <= 14) {
    return [
      "Schedule a check-up with your primary care physician",
      "Try to identify and challenge negative thought patterns",
      "Establish a daily routine that includes physical activity",
      "Consider using a mood tracking app to identify patterns",
      "Limit alcohol and avoid recreational drugs"
    ];
  } else if (score <= 19) {
    return [
      "Consider speaking with a mental health professional",
      "Practice stress-reduction techniques like deep breathing or progressive muscle relaxation",
      "Establish regular sleep patterns and healthy eating habits",
      "Set small, achievable goals each day",
      "Limit exposure to negative news and social media"
    ];
  } else {
    return [
      "Make an appointment with a mental health professional as soon as possible",
      "If you have thoughts of harming yourself, call a crisis hotline immediately",
      "Inform a trusted friend or family member about how you're feeling",
      "Focus on basic self-care: sleep, nutrition, and gentle exercise",
      "Remember that depression is treatable and help is available"
    ];
  }
};

const TestPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredPoints, setAnsweredPoints] = useState(new Array(questions.length).fill(0));

  const handleAnswerChange = (answer, points) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    
    // Update points for this specific question
    const updatedPoints = [...answeredPoints];
    // Subtract the previous points for this question if any
    const totalScore = score - updatedPoints[currentQuestion] + points;
    updatedPoints[currentQuestion] = points;
    
    setAnswers(updatedAnswers);
    setAnsweredPoints(updatedPoints);
    setScore(totalScore);
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
    if (score <= 4) {
      return "Minimal or no depression. Keep maintaining a positive outlook!";
    } else if (score <= 9) {
      return "Mild depression. Consider implementing some self-care strategies.";
    } else if (score <= 14) {
      return "Moderate depression. It could be helpful to talk to a healthcare provider.";
    } else if (score <= 19) {
      return "Moderately severe depression. Consider seeking professional support.";
    } else {
      return "Severe depression. Please seek help from a mental health professional as soon as possible.";
    }
  };

  return (
    <div className="test-page">
      <Card className="test-card2">
        <Title level={2} className="test-title">Depression Test</Title>
        <Paragraph className="test-description">
          Answer the following questions to assess your symptoms of depression.
        </Paragraph>

        {/* Progress indicator */}
        {!completed && (
          <div className="progress-indicator">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        )}

        {/* Animated Question Section */}
        {completed ? (
          <div className="result-container">
            <Result
              status="success"
              title="Test Completed"
              subTitle={`Your score: ${score} out of ${questions.length * 3}`}
            />
            <div className="assessment">
              <Title level={4}>Assessment:</Title>
              <Paragraph>{getAssessment()}</Paragraph>
            </div>
            <div className="personalized-suggestions">
              <Title level={4}>Personalized Suggestions:</Title>
              <List
                bordered
                dataSource={getSuggestions(score)}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </div>
            <Paragraph className="disclaimer" type="secondary">
              Note: This is a screening tool and not a diagnostic instrument. Please consult with a healthcare professional for proper evaluation and treatment.
            </Paragraph>
          </div>
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
          <Space size="large" className="navigation-buttons">
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
              onClick={nextQuestion} 
              disabled={answers[currentQuestion] === null}
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