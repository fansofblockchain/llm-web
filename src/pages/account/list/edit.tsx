import React, { useEffect, useState } from "react";
import { Form, Input, Switch } from "antd";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Prop {
  formRef?: any;
}

const App: React.FC<Prop> = ({ formRef }) => {
  useEffect(() => {
    formRef.current?.resetFields();
  }, []);

  return (
    <div id="edit-container">
      <Form
        {...layout}
        ref={formRef}
        name="control-ref"
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="username"
          label="账号"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="nickname"
          label="昵称"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="user_auth" label="账号管理权限">
          <Switch />
        </Form.Item>
        <Form.Item name="team_auth" label="团队管理权限">
          <Switch />
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
