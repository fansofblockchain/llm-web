import { Avatar, Card, Skeleton, Switch, Modal, message, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { TopicParams } from "../type";
import "./index.less";
import type { FormInstance } from "antd/es/form";
import ChatStorageManager from "../ChatStorageManager";
import Topic from "../../components/topic";
import User from "../teamuser";
import TeamSelect from "../../components/TeamSelect";

const App: React.FC = () => {
  const url_team_arr = location.search.split("team_id=");
  const url_team_id = Number(url_team_arr[1]) || undefined;
  const [messageApi, contextHolder] = message.useMessage();
  const [selectTeam, setSelectTeam] =  useState<number|undefined>(url_team_id);
  const [topic_id, setTopicId] =useState<number>();

  const handleSelectTeam = (value: number) => {
    setSelectTeam(value);
  };
  const isMobile = window.mobileCheck();
  return (
    <div id="manager">
      {contextHolder}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          height: "100%",
          width: "100%",
        }}
      >
        <div className="left-box">
          <div className="team-select">
            <TeamSelect
              is_manager={true}
              value={selectTeam}
              onChange={handleSelectTeam}
            />
          </div>
          <Topic
            team_id={selectTeam}
            topic_id={topic_id}
            setTopicId={setTopicId}
          />
        </div>
        <div className="center-box">
          <ChatStorageManager topic_id={topic_id} />
        </div>
        <div className="right-box">
          <User team_id={selectTeam} />
        </div>
      </div>
    </div>
  );
};

export default App;
