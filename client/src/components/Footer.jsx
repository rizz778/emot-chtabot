import React from 'react';
import { Layout, Typography, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import './Footer.css';  // Import CSS file for styling

const { Text } = Typography;

const Footer = () => {
  return (
    <Layout.Footer className="footer">
      <div className="footer-content">
        <Row justify="space-between" align="middle">
          <Col span={6}>
            <Text className="footer-title">Important Links</Text>
            <ul className="footer-links">
              <li>
                <Link to="/about-us">About Us</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact-us">Contact Us</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </Col>
          <Col span={6}>
            <Text className="footer-title">Support & Resources</Text>
            <ul className="footer-links">
              <li>
                <Link to="/support">Customer Support</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/tutorials">Tutorials</Link>
              </li>
              <li>
                <Link to="/help-center">Help Center</Link>
              </li>
            </ul>
          </Col>
          <Col span={6}>
            <Text className="footer-title">Company</Text>
            <ul className="footer-links">
              <li>
                <Link to="/team">Meet the Team</Link>
              </li>
              <li>
                <Link to="/investors">Investors</Link>
              </li>
              <li>
                <Link to="/press">Press</Link>
              </li>
              <li>
                <Link to="/partnerships">Partnerships</Link>
              </li>
            </ul>
          </Col>
          <Col span={6} className="footer-info">
            <Text className="footer-title">Stay Connected</Text>
            <Row gutter={[16, 16]} justify="center">
              <Col>
                <Button shape="circle" icon={<i className="fab fa-facebook-f" />} size="large" />
              </Col>
              <Col>
                <Button shape="circle" icon={<i className="fab fa-twitter" />} size="large" />
              </Col>
              <Col>
                <Button shape="circle" icon={<i className="fab fa-linkedin-in" />} size="large" />
              </Col>
              <Col>
                <Button shape="circle" icon={<i className="fab fa-instagram" />} size="large" />
              </Col>
            </Row>
            <Text>© 2025 Sentio. All rights reserved.</Text>
          </Col>
        </Row>
      </div>
    </Layout.Footer>
  );
};

export default Footer;
