import React from "react";
import { message, Upload, Table, Modal, UploadProps } from "antd";
import { useState, useEffect } from "react";
import pdfImg from "@/assets/chat/PDF.svg";
import txtImg from "@/assets/chat/txt.svg";
import mdImg from "@/assets/chat/MD.svg";
import type { ColumnsType } from "antd/es/table";
import { getFileList, deleteFile } from "../api";
import { LoadingOutlined } from "@ant-design/icons";
import "./index.less";

const { Dragger } = Upload;

interface DataType {
  key: React.Key;
  name: string;
  status: number;
}

interface Props {
  topic_id?: number;
}

const ChatStorageManager = (props: Props) => {
  const { topic_id } = props;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (topic_id: number) => {
    setLoading(true);
    const result: any = await getFileList({ topic_id });
    if (result.code === 0 && result.data) {
      result.data.forEach((item: any) => {
        item.key = item.id;
      });
      // 判断数据是否相同
      if (JSON.stringify(result.data) !== JSON.stringify(list)) {
        setList(result.data);
      }
    }
    setLoading(false);
  };
  const columns: ColumnsType<DataType> = [
    {
      title: "主题材料",
      dataIndex: "name",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (text: number) => (
        <div>
          {text === 1 ? (
            <div>
              训练中
              <LoadingOutlined style={{ marginLeft: 8 }} />
            </div>
          ) : (
            "已完成"
          )}
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "x",
      width: 100,
      render: (id) => (
        <a
          onClick={() => {
            Modal.info({
              title: "是否删除该文档",
              content: "删除该文档后模型将无法根据该文档进行问答",
              onOk: async () => {
                const res: any = await deleteFile({ id: id });
                if (res.code === 0) {
                  topic_id && fetchData(topic_id);
                }
              },
            });
          }}
        >
          删除
        </a>
      ),
    },
  ];
  // useEffect(() => {
  //   if (topic_id) {
  //     fetchData(topic_id);
  //   }
  // }, [topic_id]);

  useEffect(() => {
    // 定义定时器
    if (topic_id) {
      fetchData(topic_id);
    }
    const timer = setInterval(() => {
      // 在这里调用 fetchData 函数进行数据拉取
      if (topic_id) {
        fetchData(topic_id);
      }
    }, 10000); // 每10秒执行一次

    // 组件卸载时清除定时器
    return () => {
      clearInterval(timer);
    };
  }, [topic_id]);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    action: `http://web.responds.top/api/demo/uploadfile/${topic_id}`,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} 上传完成，开始训练.`);
        topic_id && fetchData(topic_id);
      } else if (status === "error") {
        message.error(`${info.file.name} 上传失败.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };
  return (
    <div id="data-manager">
      <div className="upload-box">
        <Dragger {...uploadProps} className="upload-box">
          <p className="ant-upload-text upload-text">
            您可以导入任何你获取的文件文档
          </p>
          <p className="ant-upload-drag-icon">
            <img src={pdfImg} alt="" className="uplaod-img" />
            <img src={mdImg} alt="" className="uplaod-img" />
            <img src={txtImg} alt="" className="uplaod-img" />
          </p>
        </Dragger>
        <div className="upload-history">
          <Table
            loading={loading}
            columns={columns}
            dataSource={list}
            pagination={{ pageSize: 50 }}
            scroll={{ y: "558px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatStorageManager;
