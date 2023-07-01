import React, { useEffect } from "react";
import { Form, Input } from "antd";
import "./index.less";
import { TopicParams } from "../../team/type";
import localStorageService from "../../../utils/LocalStorageService";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Prop {
  param?: TopicParams;
  formRef?: any;
}

const App: React.FC<Prop> = ({ param, formRef }) => {
  const storedUser = localStorageService.getItem(
    "user"
  );
  console.log(storedUser);
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
    formRef.current?.setFieldsValue(param);
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
        <Form.Item name="prompts" label="prompts">
          <Input />
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
