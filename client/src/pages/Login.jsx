import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Row, Col, Typography, Divider, message } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    console.log("Login Attempt:", values); // ✅ Debugging log
     const {email,password} = values;
    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", {email,password});

      console.log("Login Response:", response.data); // ✅ Debugging log

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // Store token and user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      message.success("Login successful!");
      navigate("/chat"); // Redirect user after login
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      message.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <div className="login-card">
            <Title level={2} className="login-title">
              Welcome Back
            </Title>
            <Text type="secondary" className="login-subtitle">
              Please sign in to continue
            </Text>

            <Form
              form={form}
              name="login-form"
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              className="login-form"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password">Forgot password?</Link>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                  Sign In
                </Button>
              </Form.Item>

              <Divider plain>Or continue with</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Button icon={<GoogleOutlined />} size="large" block className="social-btn google-btn">
                    Google
                  </Button>
                </Col>
                <Col span={12}>
                  <Button icon={<FacebookFilled />} size="large" block className="social-btn facebook-btn">
                    Facebook
                  </Button>
                </Col>
              </Row>

              <div className="register-cta">
                <Text>Don't have an account? </Text>
                <Link to="/signup">Create account</Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
