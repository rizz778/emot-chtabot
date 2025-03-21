import React from "react";
import { Tabs } from "antd";
import Therapists from "./Therapists";
import CommunityForum from "./CommunityForum";
const { TabPane } = Tabs;

const TwoTabPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="Book An Appointment" key="1">
         <Therapists/>
        </TabPane>
        <TabPane tab="Community Forum" key="2">
            <CommunityForum/>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TwoTabPage;
