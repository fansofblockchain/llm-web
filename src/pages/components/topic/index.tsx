import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Card, Skeleton, Switch, Modal, message, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { TopicParams } from "../../team/type";
import Edit from "./edit";
import "./index.less";
import type { FormInstance } from "antd/es/form";
import { getTopicList, addTopic, updateTopic } from "../../team/api";

const { Meta } = Card;

interface Props {
  team_id?: number;
  topic_id?: number;
  readonly?: boolean;
  setTopicId: Function;
}

const App = (props: Props) => {
  const { team_id, readonly, setTopicId, topic_id } = props;
  const formRef = React.useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [editParams, setEditParams] = useState<TopicParams>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [list, setList] = useState<TopicParams[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, [team_id]);

  const fetchData = async () => {
    if (team_id) {
      setLoading(true);
      const result: any = await getTopicList({ team_id: team_id });
      if (result.code === 0) {
        setList(result.data);
        // if(!topic_id){
        if (result.data && result.data[0]) {
          setTopicId(result.data[0].id);
        } else {
          setTopicId(-1);
        }
      }
      setLoading(false);
    } else {
      setTopicId(-1);
    }
  };

  const handleSave = async (data: TopicParams) => {
    try {
      const checkedObj = await formRef?.current?.validateFields();
      setSaveLoading(true);
      const putData = {
        ...data,
        decription: data.decription || "",
        prompts: data.prompts || "",
      };
      let result: any;
      if (editParams) {
        result = await updateTopic({
          ...editParams,
          ...putData,
          team_id: team_id,
        });
      } else {
        result = await addTopic({ ...putData, team_id: team_id });
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

  return (
    <div
      id="topic-containter"
      style={
        readonly
          ? {
              border: 0,
            }
          : {}
      }
    >
      {contextHolder}
      {!readonly && <div className="topic-title">主题列表</div>}
      <div className="topic-box">
        {list.map((item: TopicParams) => (
          <div
            className={`${
              topic_id === item.id ? "topic-select " : " "
            }topic-item`}
            onClick={() => {
              if (loading || saveLoading) {
                return;
              }
              setTopicId(item.id);
            }}
          >
            {item.name}
            {!readonly && (
              <EditOutlined
                className="edit"
                onClick={() => {
                  setEditParams(item);
                  formRef.current?.setFieldsValue(item);
                  setOpen(true);
                }}
              />
            )}
          </div>
        ))}
        {!list ||
          (list.length === 0 && (
            <div style={{ textAlign: "center", color: "#666666" }}>
              请先添加主题
            </div>
          ))}

        {!readonly && (
          <div
            className="topic-item add-topic"
            onClick={() => {
              setEditParams(undefined);
              setOpen(true);
            }}
          >
            <PlusOutlined style={{ marginRight: "4px" }} />
            新增主题
          </div>
        )}
      </div>

      <Modal
        title="主题编辑"
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
