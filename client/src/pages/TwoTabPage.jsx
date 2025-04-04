import React from "react";
import { Tabs } from "antd";
import Therapists from "./Therapists";
import CommunityForum from "./CommunityForum";
const { TabPane } = Tabs;

const TwoTabPage = () => {
  // Custom styles for the tab labels
  const tabLabelStyle = {
    fontSize: '18px',  // Larger font size
    fontWeight: '500', // Medium weight for better visibility
    padding: '0 10px'  // Add some horizontal padding for better spacing
  };

  return (
    <div style={{ padding: 20 }}>
      <Tabs 
        defaultActiveKey="1" 
        centered
        // Apply custom class for additional styling
        className="large-tab-headers"
      >
        <TabPane 
          tab={<span style={tabLabelStyle}>Book An Appointment</span>} 
          key="1"
        >
          <Therapists/>
        </TabPane>
        <TabPane 
          tab={<span style={tabLabelStyle}>Community Forum</span>} 
          key="2"
        >
          <CommunityForum/>
        </TabPane>
      </Tabs>

      {/* Add global styles to affect the tab elements */}
      <style jsx global>{`
        /* Target the tab headers specifically */
        .large-tab-headers .ant-tabs-tab {
          margin: 0 12px;
        }
        
        /* Adjust the active tab indicator width to match the larger text */
        .large-tab-headers .ant-tabs-ink-bar {
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default TwoTabPage;