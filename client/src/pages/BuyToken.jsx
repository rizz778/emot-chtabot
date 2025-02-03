import React, { useState } from "react";
import { Card, Button, Row, Col, Typography } from "antd";
import {
  CheckCircleOutlined,
  StarOutlined,
  RocketOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import "./BuyToken.css";
import photo5 from "../assets/images/photo_4.jpg"
const { Title, Text } = Typography;

const BuyToken = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Subscription plans with equal features
  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "₹199/month",
      features: [
        "Access to basic chatbot therapy",
        "Limited emotional support",
        "1 chat session per day",
        "Basic mood tracking",
        "Access to common coping strategies",
      ],
    },
    {
      id: 2,
      name: "Pro Plan",
      price: "₹299/month",
      features: [
        "Access to advanced therapy sessions",
        "Priority emotional support",
        "Unlimited chat sessions",
        "Advanced mood tracking",
        "Personalized coping strategies",
      ],
    },
    {
      id: 3,
      name: "Enterprise Plan",
      price: "₹599/month",
      features: [
        "Access to expert recommendations",
        "24/7 dedicated emotional support",
        "Unlimited chat and voice sessions",
        "Real-time emotion analysis",
        "Custom therapy plans",
      ],
    },
  ];

  // Handle subscription button click
  const handleSubscription = (planId) => {
    alert(`You selected plan ${planId}. Redirecting to payment...`);
    // Add payment gateway integration here
  };

  // Map feature icons
  const featureIcons = {
    "Access to basic features": <CheckCircleOutlined />,
    "Limited support": <CustomerServiceOutlined />,
    "Up to 5 projects": <RocketOutlined />,
    "1 GB storage": <DatabaseOutlined />,
    "Basic analytics": <BarChartOutlined />,
    "Access to all features": <CheckCircleOutlined />,
    "Priority support": <StarOutlined />,
    "Up to 20 projects": <RocketOutlined />,
    "10 GB storage": <DatabaseOutlined />,
    "Advanced analytics": <BarChartOutlined />,
    "24/7 dedicated support": <CustomerServiceOutlined />,
    "Unlimited projects": <RocketOutlined />,
    "100 GB storage": <DatabaseOutlined />,
    "Custom integrations": <AppstoreAddOutlined />,
  }; 

  return (
    <section>
        
        <div className="text-center">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold pt-9" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              <span className="text-[#fff0f6]">WHERE COMPASSION MEETS </span> 
              <span className="text-[#64f7ff]">AFFORDABILITY </span>
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold pt-8 pb-6" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              <span className="text-[#64f7ff] mx-auto">PLANS AND PRICINGS </span>
            </h1>
          </div>
         
      <div className="buy-token-container">
        <Row gutter={[16, 16]} justify="center">
          {subscriptionPlans.map((plan) => (
            <Col key={plan.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                className={`subscription-card ${
                  selectedPlanId === plan.id ? "selected" : ""
                }`}
                onClick={() => setSelectedPlanId(plan.id)}
                title={
                  <div>
                    <span className="card-title">{plan.name}</span>
                  </div>
                }
                bordered={false}
                hoverable
              >
                <Title
                  level={3}
                  className="price-text price-text-large"
                  style={{ fontSize: "24px", fontWeight: "bold" }}
                >
                  {plan.price}
                </Title>
                <div className="feature-list">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">{featureIcons[feature]}</span>
                      <Text className="feature-text">{feature}</Text>
                    </div>
                  ))}
                </div>
                <Button
                  className={`subscribe-button ${
                    selectedPlanId === plan.id ? "primary" : "default"
                  }`}
                  size="large"
                  onClick={() => handleSubscription(plan.id)}
                >
                  {selectedPlanId === plan.id ? "Get Started" : "Subscribe"}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default BuyToken;
