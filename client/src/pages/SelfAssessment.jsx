import React from 'react';
import { Card, Row, Col, Typography, Divider } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import './SelfAssessment.css';

const { Title, Paragraph } = Typography;

const categories = [
  {
    name: 'Mood Disorders',
    description: 'Assess and understand your emotional patterns',
    tests: [
      { name: 'Depression Screening', questions: 20, image: 'depression.jpg' },
      { name: 'Bipolar Tendencies Test', questions: 15, image: 'bipolar.jpg' },
      { name: 'Mood Tracker Assessment', questions: 10, image: 'mood.jpg' },
    ]
  },
  {
    name: 'Anxiety & Stress',
    description: 'Evaluate your stress levels and anxiety patterns',
    tests: [
      { name: 'Generalized Anxiety Test', questions: 18, image: 'anxiety.jpg' },
      { name: 'Social Anxiety Scale', questions: 12, image: 'social-anxiety.jpg' },
      { name: 'Stress Level Analyzer', questions: 15, image: 'stress.jpg' },
    ]
  },
  {
    name: 'Personality & Emotional Well-being',
    description: 'Understand your personality traits and emotional health',
    tests: [
      { name: 'Big Five Personality Test', questions: 50, image: 'personality.jpg' },
      { name: 'Emotional Intelligence Test', questions: 25, image: 'emotional-intelligence.jpg' },
      { name: 'Self-Esteem Scale', questions: 10, image: 'self-esteem.jpg' },
    ]
  },
  {
    name: 'Trauma & PTSD',
    description: 'Assess symptoms related to trauma and PTSD',
    tests: [
      { name: 'PTSD Checklist for DSM-5', questions: 20, image: 'ptsd.jpg' },
      { name: 'Trauma History Questionnaire', questions: 15, image: 'trauma.jpg' },
      { name: 'CPTSD Inventory', questions: 12, image: 'cptsd.jpg' },
    ]
  },
  {
    name: 'Sleep & Fatigue',
    description: 'Evaluate your sleep patterns and fatigue levels',
    tests: [
      { name: 'Sleep Quality Index', questions: 12, image: 'sleep.jpg' },
      { name: 'Insomnia Severity Index', questions: 7, image: 'insomnia.jpg' },
      { name: 'Fatigue Severity Scale', questions: 9, image: 'fatigue.jpg' },
    ]
  },
  {
    name: 'Substance Use & Addictions',
    description: 'Evaluate your risk of substance use and addiction',
    tests: [
      { name: 'Alcohol Use Disorders Test (AUDIT)', questions: 10, image: 'alcohol.jpg' },
      { name: 'Drug Abuse Screening Test (DAST)', questions: 20, image: 'drug.jpg' },
      { name: 'Addiction Severity Index', questions: 21, image: 'addiction.jpg' },
    ]
  },
 
  {
    name: 'Self-Harm & Suicide Risk',
    description: 'Identify risk factors related to self-harm and suicide',
    tests: [
      { name: 'Suicide Risk Assessment', questions: 15, image: 'suicide-risk.jpg' },
      { name: 'Self-Harm Behavior Questionnaire', questions: 20, image: 'self-harm.jpg' },
      { name: 'Suicidal Ideation Questionnaire', questions: 10, image: 'suicidal-ideation.jpg' },
    ]
  }
];

const SelfAssessment = () => {
  return (
    <div className="landing-page">
      <Title level={1} className="main-title">Mental Health Assessments</Title>
      <Paragraph className="subtitle">
        Explore our comprehensive range of psychological evaluations and self-assessment tools
      </Paragraph>

      {categories.map((category, index) => (
        <section key={index} className="category-section">
          <Divider orientation="left">
            <Title level={3} className="category-title">
              {category.name}
              <Paragraph className="category-description">{category.description}</Paragraph>
            </Title>
          </Divider>

          <Row gutter={[24, 24]}>
            {category.tests.map((test, testIndex) => (
              <Col key={testIndex} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="test-card"
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <img src={`images/${test.image}`} alt={test.name} className="test-image" />
                      <div className="card-content">
                        <Title level={5} className="test-title">{test.name}</Title>
                        <Paragraph className="test-meta">
                          {test.questions} Questions • 10-15 mins
                        </Paragraph>
                      </div>
                    </div>
                    <div className="card-back">
                      <button className="start-test-btn">
                        Start Test <RightOutlined />
                      </button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </div>
  );
};

export default SelfAssessment;
