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

const { Title, Text } = Typography;

const BuyToken = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Subscription plans with their details
  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "$10/month",
      features: [
        "Access to basic features",
        "Limited support",
        "Up to 5 projects",
        "1 GB storage",
      ],
    },
    {
      id: 2,
      name: "Pro Plan",
      price: "$30/month",
      features: [
        "Access to all features",
        "Priority support",
        "Up to 20 projects",
        "10 GB storage",
        "Advanced analytics",
      ],
    },
    {
      id: 3,
      name: "Enterprise Plan",
      price: "$100/month",
      features: [
        "Access to all features",
        "24/7 dedicated support",
        "Unlimited projects",
        "100 GB storage",
        "Advanced analytics",
        "Custom integrations",
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
    <div className="buy-token-container">
      <Title level={2} className="buy-token-title">
        Choose Your Plan
      </Title>
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
              <Title level={3} className="price-text">
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
  );
};

export default BuyToken;