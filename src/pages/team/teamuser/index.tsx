import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Card,
  Skeleton,
  Switch,
  Modal,
  message,
  Spin,
  Popover,
} from "antd";
import React, { useState, useEffect } from "react";
import { TeamUserParams } from "../type";
import Edit from "./edit";
import "./index.less";
import type { FormInstance } from "antd/es/form";
import {
  updateTopic,
  addTeamUser,
  updateTeamUser,
  getTeamRole,
  deleteTeamUser,
  getTeamUserList,
} from "../api";

const { Meta } = Card;

const role_name = ["创建者", "管理员", "用户"];
const App = (props: { team_id?: number }) => {
  const formRef = React.useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [list, setList] = useState<TeamUserParams[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [props.team_id]);

  const fetchData = async () => {
    if (props.team_id) {
      setLoading(true);
      const result: any = await getTeamUserList({ team_id: props.team_id });
      if (result.code === 0) {
        setList(result.data);
      }
      setLoading(false);
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      const checkedObj = await formRef?.current?.validateFields();
      setSaveLoading(true);
      let putArr: any = [];
      data.users.forEach((user: any) => {
        let isExist = false;
        list.forEach((item: any) => {
          if (item.user_id === user) {
            isExist = true;
          }
        });
        if (!isExist) {
          putArr.push({
            user_id: user,
            role_id: 3,
            team_id: props.team_id,
          });
        }
      });

      let result: any = await addTeamUser({ list: putArr });

      if (result.code === 0) {
        setOpen(false);
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

  const handleUpdateUser = async (teamuser: TeamUserParams) => {
    const res: any = await updateTeamUser({
      ...teamuser,
      role_id: teamuser.role_id === 3 ? 2 : 3,
      team_id: props.team_id,
    });
    if (res.code === 0) {
      messageApi.open({
        type: "success",
        content: "操作成功",
      });
      fetchData();
    } else {
      messageApi.open({
        type: "error",
        content: res.message || "操作失败",
      });
    }
  };

  const handleDeleteUser = async (teamuser: TeamUserParams) => {
    const res: any = await deleteTeamUser({
      ...teamuser,
      team_id: props.team_id,
    });
    if (res.code === 0) {
      messageApi.open({
        type: "success",
        content: "操作成功",
      });
      fetchData();
    } else {
      messageApi.open({
        type: "error",
        content: res.message || "操作失败",
      });
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
    <div id="user-containter">
      {contextHolder}
      <div className="user-title">团队成员</div>
      <div className="user-box">
        {list.map((item: TeamUserParams) => (
          <Popover
            style={{ padding: 0 }}
            title={`${item.username}${
              item.nickname ? "【" + item.nickname + "】" : ""
            }`}
            content={
              item.role_id === 1 ? null : (
                <div id="user-operate">
                  <p
                    className="operate-box"
                    onClick={() => handleUpdateUser(item)}
                  >
                    设为 {item.role_id === 3 ? "管理" : "普通用户"}
                  </p>
                  <p
                    className="operate-box"
                    onClick={() => handleDeleteUser(item)}
                  >
                    移除该用户
                  </p>
                </div>
              )
            }
            placement="left"
            trigger={["click"]}
          >
            <div className="user-item" key={item.user_id + "_" + item.username}>
              {item.nickname || item.username}【
              {role_name[item.role_id ? item.role_id - 1 : 2]}】
              {item.role_id === 1 ? null : (
                <EditOutlined className="edit" onClick={() => {}} />
              )}
            </div>
          </Popover>
        ))}
        <div
          className="user-item add-user"
          onClick={() => {
            setOpen(true);
          }}
        >
          <PlusOutlined style={{ marginRight: "4px" }} />
          添加用户
        </div>
      </div>
      <Modal
        title="主题编辑"
        centered
        open={open}
        onOk={() => {
          const putObj = formRef.current?.getFieldsValue();
          handleAddUser(putObj);
        }}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <Edit param={list} formRef={formRef} />
      </Modal>
    </div>
  );
};

export default App;
