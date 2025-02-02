import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Typography, Divider, Checkbox,message} from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'
import axios from "axios"
const { Title, Text } = Typography;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
 const navigate = useNavigate();
  const handleSubmit = async (values) => {
    const { username, email, password } = values;
    setLoading(true);
    try {
      console.log("Sending:", username, email, password);

      const response=await axios.post('https://emot-chtabot-1.onrender.com/api/auth/signup',{
        username, email, password
      });

      const {token,user}=response.data;
      console.log(response.data);

      // Store token and user details in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      message.success('SignUp successful!');
      navigate('/chat'); // Redirect user after login

      console.log('Received values:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Signup successful!');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <div className="signup-card">
            <Title level={2} className="signup-title">
              Create Your Account
            </Title>
            <Text type="secondary" className="signup-subtitle">
              Join us to get started
            </Text>

            <Form
              form={form}
              name="signup-form"
              onFinish={handleSubmit}
              className="signup-form"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your full name!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Full Name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('The two passwords do not match!');
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject('You must agree to the terms and conditions!'),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the <Link to="/terms">terms and conditions</Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  Sign Up
                </Button>
              </Form.Item>

              <Divider plain>Or sign up with</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    icon={<GoogleOutlined />}
                    size="large"
                    block
                    className="social-btn google-btn"
                  >
                    Google
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    icon={<FacebookFilled />}
                    size="large"
                    block
                    className="social-btn facebook-btn"
                  >
                    Facebook
                  </Button>
                </Col>
              </Row>

              <div className="login-cta">
                <Text>Already have an account? </Text>
                <Link to="/login">Log in</Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Signup;