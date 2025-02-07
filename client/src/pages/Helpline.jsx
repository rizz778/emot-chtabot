import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Title, Text } = Typography;

const Helpline = () => {
  // Sample data for helplines
  const helplines = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '1-800-273-TALK (8255)',
      website: 'https://suicidepreventionlifeline.org',
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org',
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-HELP (4357)',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
    },
    {
      name: 'Trevor Project (LGBTQ+ Support)',
      phone: '1-866-488-7386',
      website: 'https://www.thetrevorproject.org',
    },
    {
      name: 'Veterans Crisis Line',
      phone: '1-800-273-8255 (Press 1)',
      website: 'https://www.veteranscrisisline.net',
    },
    {
      name: 'Childhelp National Child Abuse Hotline',
      phone: '1-800-422-4453',
      website: 'https://www.childhelp.org',
    },
    {
      name: 'National Eating Disorders Association',
      phone: '1-800-931-2237',
      website: 'https://www.nationaleatingdisorders.org',
    },
    {
      name: 'Postpartum Support International',
      phone: '1-800-944-4773',
      website: 'https://www.postpartum.net',
    },
    {
      name: 'National Alliance on Mental Illness (NAMI)',
      phone: '1-800-950-NAMI (6264)',
      website: 'https://www.nami.org',
    },
    {
      name: 'Substance Abuse and Mental Health Services Administration',
      phone: '1-800-662-HELP (4357)',
      website: 'https://www.samhsa.gov',
    },
    {
      name: 'Disaster Distress Helpline',
      phone: '1-800-985-5990',
      website: 'https://www.samhsa.gov/find-help/disaster-distress-helpline',
    },
    {
      name: 'National Domestic Violence Hotline',
      phone: '1-800-799-SAFE (7233)',
      website: 'https://www.thehotline.org',
    },
  ];

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', minHeight: '100vh' }}>
      <Title
        level={2}
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: '#ffffff', // White font color
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // Text shadow for better visibility
        }}
      >
        Mental Health Helplines
      </Title>
      <Row gutter={[16, 16]}>
        {helplines.map((helpline, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={helpline.name}
              bordered={false}
              hoverable
              style={{
                height: '160px', // Increased card height
                background: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
                borderRadius: '10px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Space out content evenly
              }}
              bodyStyle={{ padding: '16px', flex: 1 }}
              headStyle={{
                background: 'rgba(255, 182, 193, 0.9)', // Light pink header
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                color: '#ffffff', // White font color for header
              }}
              className="helpline-card" // For custom hover effects
            >
              <div>
                <Text strong style={{ color: '#555555' }}>Phone:</Text> {helpline.phone} <br />
                <Text strong style={{ color: '#555555' }}>Website:</Text>{' '}
                <a href={helpline.website} target="_blank" rel="noopener noreferrer" style={{ color: '#ff6f61' }}>
                  {helpline.website}
                </a>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add custom CSS for hover effects */}
      <style jsx>{`
        .helpline-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Helpline;