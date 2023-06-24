import React, { useEffect, useState } from "react";
import { Form, Select } from "antd";
import "./index.less";
import { TeamUserParams } from "../type";
import { getUserList } from "../../api";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Prop {
  param?: TeamUserParams[];
  formRef?: any;
}

const App: React.FC<Prop> = ({ param, formRef }) => {
  const [userList, setUserList] = useState([]);
  useEffect(() => {
    initData();
    return () => {
      param && onReset();
    };
  }, [param]);

  const onReset = () => {
    formRef.current?.resetFields();
  };

  const fetchUserList = async () => {
    const res = await getUserList();
    res.data.forEach((user: any) => {
      user.label = user.username;
      user.value = user.id;
    });
    setUserList(res.data);
  };

  const initData = () => {
    let list: number[] = [];
    param?.forEach((item) => {
      typeof item.user_id === "number" && list.push(item.user_id);
    });
    formRef.current?.setFieldsValue({ users: list });
    fetchUserList();
  };

  return (
    <div id="edit-container">
      <Form
        {...layout}
        ref={formRef}
        name="control-ref"
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="users" label="名称" rules={[{ required: true }]}>
          <Select mode="multiple" placeholder="请选择用户" options={userList} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
