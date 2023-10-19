import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Card, Skeleton, Switch, Modal, message, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { TeamParams } from "../type";
import Edit from "./edit";
import "./index.less";
import type { FormInstance } from "antd/es/form";
import { getTeamList, addTeam, updateTeam } from "../api";
import { useNavigate } from "react-router-dom";
import localStorageService from "../../../utils/LocalStorageService";

const { Meta } = Card;

const App: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [editParams, setEditParams] = useState<TeamParams>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [list, setList] = useState<TeamParams[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  const storedUser: any = localStorageService.getItem("user");
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result: any = await getTeamList({ is_manager: true });
    if (result.code === 0) {
      setList(result.data);
    }
    setLoading(false);
  };

  const handleSave = async (data: TeamParams) => {
    try {
      const checkedObj = await formRef?.current?.validateFields();
      setSaveLoading(true);
      const putData = {
        ...data,
        decription: data.decription || "",
        state: data.state ? "enabled" : "disabled",
      };
      let result: any;
      if (editParams) {
        result = await updateTeam({
          ...editParams,
          ...putData,
          id: editParams.team_id,
        });
      } else {
        result = await addTeam({ ...putData });
      }

      if (result.code === 0) {
        setOpen(false);
        setEditParams(undefined);
        formRef.current?.resetFields();
        fetchData();
      }
      messageApi.open({
        type: "success",
        content: "保存成功",
      });
      setSaveLoading(false);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  const openTips = (data: string) => {
    messageApi.open({
      type: "success",
      content: data,
    });
  };
  const isMobile = window.mobileCheck();
  return (
    <div id="team-container">
      {contextHolder}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {list.map((param: TeamParams) =>
          param.team_id === 0 ? null : (
            <Card
              key={param.id}
              onClick={() => {
                navigate(`/console/team/manager?team_id=${param.team_id}`);
              }}
              className="card-box"
              style={{
                width: isMobile ? "100%" : 300,
              }}
            >
              <Skeleton loading={loading} avatar active>
                <Meta
                  avatar={
                    <Avatar>
                      {param && param.name
                        ? param.name[0].toLocaleUpperCase()
                        : ""}
                    </Avatar>
                  }
                  title={
                    <div>
                      {param.name}
                      <EditOutlined
                        className="edit-name"
                        key="edit"
                        onClick={(event: any) => {
                          event.stopPropagation && event.stopPropagation();
                          event.cancelBubble = true;
                          setEditParams(param);
                          formRef.current?.setFieldsValue(param);
                          setOpen(true);
                        }}
                      />
                    </div>
                  }
                  description={<div className="team-description">{ param.decription || ""}</div>}
                />
              </Skeleton>
            </Card>
          )
        )}
        {storedUser && storedUser.team_auth ? (
          <Card
            className="card-box"
            style={{
              width: isMobile ? "100%" : 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {
              setEditParams(undefined);
              setOpen(true);
            }}
          >
            {loading ? <Spin /> : "新增"}
          </Card>
        ) : null}
      </div>
      <Modal
        title="团队编辑"
        centered
        open={open}
        onOk={() => {
          const putObj = formRef.current?.getFieldsValue();
          handleSave(putObj);
        }}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <Edit param={editParams} formRef={formRef} />
      </Modal>
    </div>
  );
};

export default App;
