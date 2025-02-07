import React, { useState } from "react";
import { Tabs, Card, List, Avatar } from "antd";
import {
  AudioOutlined,
  VideoCameraOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import "./Resource.css"; // Custom CSS for animations and hover effects

const { TabPane } = Tabs;

const Resource = () => {
  const [activeTab, setActiveTab] = useState("audio"); // Default to Audio tab

  // Sample data for resources
  const audioResources = [
    {
      title: "Guided Meditation",
      description: "A 10-minute guided meditation for stress relief.",
      link: "https://open.spotify.com/track/1buvmZ3wdzJ2I7mqd1ifNs", // Spotify link
    },
    {
      title: "Relaxing Music",
      description: "Soothing music to help you relax and focus.",
      link: "https://open.spotify.com/playlist/1r4hnyOWexSvylLokn2hUa", // Spotify link
    },
  ];

  const videoResources = [
    {
      title: "Mindfulness Techniques",
      description: "Learn mindfulness techniques in 5 minutes.",
      link: "https://www.youtube.com/watch?v=ZToicYcHIOU", // YouTube link
    },
    {
      title: "Yoga for Beginners",
      description: "A beginner-friendly yoga session for mental wellness.",
      link: "https://www.youtube.com/watch?v=v7AYKMP6rOE", // YouTube link
    },
  ];

  const literatureResources = [
    {
      title: "The Power of Now",
      description: "A book on mindfulness and living in the present moment.",
      link: "https://www.goodreads.com/book/show/6708.The_Power_of_Now", // Goodreads link
    },
    {
      title: "Atomic Habits",
      description: "Learn how to build good habits and break bad ones.",
      link: "https://www.goodreads.com/book/show/40121378-atomic-habits", // Goodreads link
    },
  ];

  return (
    <div style={{ padding: "24px", fontFamily: "'Poppins', sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px", fontSize: "2.5rem", fontWeight: "600", color: "#ffffff" }}>
        Mental Health Resources
      </h1>

      <Tabs
        defaultActiveKey="audio"
        onChange={(key) => setActiveTab(key)}
        centered
        tabBarStyle={{ fontSize: "1.4rem", fontWeight: "500", color: "#ffffff" }} // Increased font size for tab names
      >
        <TabPane
          tab={
            <span>
              <AudioOutlined style={{ marginRight: "8px", color: "#ffffff" }} />
              <span style={{ color: "#ffffff", fontSize: "1.4rem" }}>Audio</span> {/* Increased font size for tab names */}
            </span>
          }
          key="audio"
        >
          <List
            itemLayout="horizontal"
            dataSource={audioResources}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="resource-card"
                  title={<span style={{ fontSize: "1.4rem", color: "#2d3436" }}>{item.title}</span>} // Darker text for better readability
                  style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  actions={[
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e84393", fontSize: "1.1rem" }}>
                      Listen Now
                    </a>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<AudioOutlined />} style={{ backgroundColor: "#e84393" }} />}
                    description={<span style={{ color: "#2d3436", fontSize: "1.1rem" }}>{item.description}</span>} // Darker text for better readability
                  />
                </Card>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <VideoCameraOutlined style={{ marginRight: "8px", color: "#ffffff" }} />
              <span style={{ color: "#ffffff", fontSize: "1.4rem" }}>Video</span> {/* Increased font size for tab names */}
            </span>
          }
          key="video"
        >
          <List
            itemLayout="horizontal"
            dataSource={videoResources}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="resource-card"
                  title={<span style={{ fontSize: "1.4rem", color: "#2d3436" }}>{item.title}</span>} // Darker text for better readability
                  style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  actions={[
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e84393", fontSize: "1.1rem" }}>
                      Watch Now
                    </a>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: "#e84393" }} />}
                    description={<span style={{ color: "#2d3436", fontSize: "1.1rem" }}>{item.description}</span>} // Darker text for better readability
                  />
                </Card>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <ReadOutlined style={{ marginRight: "8px", color: "#ffffff" }} />
              <span style={{ color: "#ffffff", fontSize: "1.4rem" }}>Literature</span> {/* Increased font size for tab names */}
            </span>
          }
          key="literature"
        >
          <List
            itemLayout="horizontal"
            dataSource={literatureResources}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="resource-card"
                  title={<span style={{ fontSize: "1.4rem", color: "#2d3436" }}>{item.title}</span>} // Darker text for better readability
                  style={{ width: "100%", backgroundColor: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  actions={[
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e84393", fontSize: "1.1rem" }}>
                      Read Now
                    </a>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<ReadOutlined />} style={{ backgroundColor: "#e84393" }} />}
                    description={<span style={{ color: "#2d3436", fontSize: "1.1rem" }}>{item.description}</span>} // Darker text for better readability
                  />
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Resource;