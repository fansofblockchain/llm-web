import React, { useEffect, useState } from "react";
import { Form, Input, Select, Switch } from "antd";
import "./index.less";
import type { SelectProps } from "antd";
import { TeamParams } from "../type";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Prop {
  param?: TeamParams;
  formRef?: any;
}

const App: React.FC<Prop> = ({ param, formRef }) => {
  useEffect(() => {
    initData();
    return () => {
      param && onReset();
    };
  }, [param]);

  const onReset = () => {
    formRef.current?.resetFields();
  };

  const initData = () => {
    let data = {
      ...param,
      state: param && param.state === "enabled" ? true : false,
    }
    formRef.current?.setFieldsValue(data);
  };

  return (
    <div id="edit-container">
      <Form
        {...layout}
        ref={formRef}
        name="control-ref"
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="decription" label="描述">
          <Input />
        </Form.Item>
        <Form.Item name="state" label="启动">
          <Switch defaultChecked={param && param.state === "enabled" ? true : false}/>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
