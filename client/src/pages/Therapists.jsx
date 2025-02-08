import React from "react";
import { Card, Button, Row, Col } from "antd";
import "./Therapists.css"; // Optional for custom styling

const { Meta } = Card;

const TherapistsData = [
  {
    id: 1,
    name: "Dr. Hrithik Khandelwal",
    specialization: "Anxiety, Depression",
    image: "images/doctor.jpg",
    description: "Experienced in cognitive behavioral therapy (CBT) and mindfulness techniques.",
  },
  {
    id: 2,
    name: "Dr. Smita Chauhan",
    specialization: "Trauma, PTSD",
    image: "images/doctor2.jpg",
    description: "Specializes in trauma-focused therapy and EMDR.",
  },
  {
    id: 3,
    name: "Dr. Ritika Hemrajani",
    specialization: "Relationship Issues, Family Therapy",
    image: "images/doctor3.jpg",
    description: "Expert in couples counseling and family systems therapy.",
  },
  {
    id: 3,
    name: "Dr. Rohit Saxena",
    specialization: "Parenting Issues, Daily Life Issues",
    image: "images/doctor4.jpg",
    description: "Expert in family systems counselling and interpersonal relationships.",
  },
];

const Therapists = () => {
  const handleBookAppointment = (therapistId) => {
    alert(`Booking appointment with therapist ID: ${therapistId}`);
    // You can replace this with a modal or a redirect to a booking page
  };

  return (
    <div className="therapists-page">
      <h1 style={{ textAlign: "center", marginBottom: "24px", fontSize: "34px", fontStyle: "bold"}}>Our Therapists</h1>
      <Row gutter={[16, 16]}>
        {TherapistsData.map((therapist) => (
          <Col key={therapist.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={therapist.name} src={therapist.image} />}
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleBookAppointment(therapist.id)}
                >
                  Book Appointment
                </Button>,
              ]}
            >
              <Meta
                title={therapist.name}
                description={
                  <>
                    <p><strong>Specialization:</strong> {therapist.specialization}</p>
                    <p>{therapist.description}</p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Therapists;