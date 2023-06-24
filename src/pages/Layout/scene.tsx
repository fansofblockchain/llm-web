import React, { useState } from "react";
import { Modal, Input, Form } from "antd";
const { TextArea } = Input;

interface Props {
  open: boolean;
  updateScene: (value: any) => void;
}

const Scene = ({ open, updateScene }: Props) => {
  return (
    <Modal
      title="新增分类库"
      open={open}
      className="scene-add"
      onOk={() => {
        updateScene(false);
      }}
      onCancel={() => {
        updateScene(false);
      }}
      okText="确定"
      cancelText="取消"
    >
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        style={{ maxWidth: 1000 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: "请输入名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="描述"
          name="description"
          rules={[{ required: false, message: "请输入描述" }]}
        >
          <TextArea />
        </Form.Item>{" "}
      </Form>
    </Modal>
  );
};

export default Scene;
