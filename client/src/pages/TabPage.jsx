import React from "react";
import { Tabs } from "antd";
import RelaxationToolsPage from "./RelaxationToolsPage";
import Helpline from "./Helpline";
import Resource from "./Resource";
const { TabPane } = Tabs;

const TabPage = () => {
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
          tab={<span style={tabLabelStyle}>Wellness Center</span>} 
          key="1"
        >
          <Resource/>
        </TabPane>
        <TabPane 
          tab={<span style={tabLabelStyle}>Relaxation Tools</span>} 
          key="2"
        >
          <RelaxationToolsPage/>
        </TabPane>
        <TabPane 
          tab={<span style={tabLabelStyle}>Helplines</span>} 
          key="3"
        >
          <Helpline/>
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

export default TabPage;