import React from "react";
import { message, Upload, Table, Modal, UploadProps } from "antd";
import { useState, useEffect } from "react";
import pdfImg from "@/assets/chat/PDF.svg";
import txtImg from "@/assets/chat/txt.svg";
import mdImg from "@/assets/chat/md.svg";
import type { ColumnsType } from "antd/es/table";

import "./index.less";

const { Dragger } = Upload;

interface DataType {
  key: React.Key;
  name: string;
  status: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: "主题材料",
    dataIndex: "name",
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    render: (text: number) => <div>{text === 1 ? "训练中" : "已完成"}</div>,
  },
  {
    title: "Action",
    dataIndex: "",
    key: "x",
    width: 100,
    render: () => (
      <a
        onClick={() => {
          Modal.info({
            title: "是否删除该文档",
            content: "删除该文档后模型将无法根据该文档进行问答",
            onOk: () => {
              console.log("删除");
            },
          });
        }}
      >
        删除
      </a>
    ),
  },
];

const data: DataType[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `file ${i}`,
    status: 1,
  });
}

const props: UploadProps = {
  name: "file",
  multiple: true,
  action: "http://model.responds.top/api/demo/uploadfile/",
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} 训练完成.`);
    } else if (status === "error") {
      message.error(`${info.file.name} 上传失败.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
};

const ChatStorageManager: React.FC = () => {
  const [list, setList] = useState([]);

  return (
    <div id="data-manager">
      <div className="upload-box">
        <Dragger {...props} className="upload-box">
          <p className="ant-upload-text upload-text">
            您可以导入任何你获取的文件文档
          </p>
          <p className="ant-upload-drag-icon">
            <img src={pdfImg} alt="" className="uplaod-img" />
            <img src={mdImg} alt="" className="uplaod-img" />
            <img src={txtImg} alt="" className="uplaod-img" />
          </p>
        </Dragger>
      </div>
      <div className="upload-history">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50 }}
          scroll={{ y: "558px" }}
        />
      </div>
    </div>
  );
};

export default ChatStorageManager;
