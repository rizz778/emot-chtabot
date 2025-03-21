import React from "react";
import { Tabs } from "antd";
import RelaxationToolsPage from "./RelaxationToolsPage";
import Helpline from "./Helpline";
import Resource from "./Resource";
const { TabPane } = Tabs;

const TabPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="Wellness Center" key="1">
         <Resource/>
        </TabPane>
        <TabPane tab="Relaxation Tools" key="2">
            <RelaxationToolsPage/>
        </TabPane>
        <TabPane tab="Helplines" key="3">
          <Helpline/>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TabPage;
