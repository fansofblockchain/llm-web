import React, { useState, useEffect } from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Popconfirm,
  Switch,
  message,
  Table,
  Typography,
  Modal,
} from "antd";
import type { FormInstance } from "antd/es/form";
const { confirm } = Modal;

import {
  getUserDetailList,
  registerUser,
  updateUser,
  deleteUser,
} from "../../api";
import { UserParams } from "../../type";
import Edit from "./edit";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "text";
  record: UserParams;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    inputType === "text" ? (
      <Input />
    ) : (
      // @ts-ignore
      dataIndex && (
        <Switch
          defaultChecked={
            dataIndex === "user_auth" ? !!record.user_auth : !!record.team_auth
          }
        />
      )
    );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const App: React.FC = () => {
  const [form] = Form.useForm();
  const formRef = React.useRef<FormInstance>(null);
  const [data, setData] = useState<UserParams[]>([]);
  const [editingKey, setEditingKey] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  const initialData = async () => {
    let res: any = await getUserDetailList();
    if (res.code === 0) {
      res.data.forEach((user: UserParams) => {
        user.key = `${user.id}_${user.username}`;
      });
      setData(res.data);
    }
  };
  useEffect(() => {
    initialData();
  }, []);

  const isEditing = (record: UserParams) => record.key === editingKey;

  const edit = (record: Partial<UserParams> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", age: "", address: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as UserParams;

      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");
        const res: any = await updateUser({
          nickname: newData[index].nickname,
          username: newData[index].username,
          team_auth: newData[index].team_auth ? 1 : 0,
          user_auth: newData[index].user_auth ? 1 : 0,
        });
        if (res.code === 0) {
          messageApi.open({
            type: "success",
            content: "修改成功",
          });
        }
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleAdd = async (putObj: UserParams) => {
    let data = {
      ...putObj,
      team_auth: putObj.team_auth ? 1 : 0,
      user_auth: putObj.user_auth ? 1 : 0,
      state: "enable",
    };
    const res: any = await registerUser(data);
    if (res.code === 0) {
      messageApi.open({
        type: "success",
        content: "添加成功",
      });
      setOpen(false);
      initialData();
    } else {
      messageApi.open({
        type: "error",
        content: res.message || "添加失败",
      });
    }
  };

  const columns = [
    {
      title: "登陆账号",
      dataIndex: "username",
      width: "15%",
      //   editable: true,
    },
    {
      title: "用户昵称",
      dataIndex: "nickname",
      width: "25%",
      editable: true,
    },
    {
      title: "登陆密码",
      dataIndex: "password",
      width: "15%",
      //   editable: true,
      render: () => <div> ****** </div>,
    },
    {
      title: "账号管理权限",
      dataIndex: "user_auth",
      width: "15%",
      editable: true,
      render: (text: number | boolean) => (text === 1 || text ? "是" : "否"),
    },
    {
      title: "团队管理权限",
      dataIndex: "team_auth",
      width: "15%",
      editable: true,
      render: (text: number | boolean) => (text === 1 || text ? "是" : "否"),
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_: any, record: UserParams, index: number) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              保存
            </Typography.Link>
            <Popconfirm
              title="确认取消?"
              cancelText="取消"
              okText="确认"
              onConfirm={cancel}
            >
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Typography.Link
              style={{ marginRight: 8 }}
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              编辑
            </Typography.Link>
            {record.username !== "admin" && (
              <Typography.Link
                disabled={editingKey !== ""}
                onClick={() => {
                  confirm({
                    title: "确认删除该用户吗?",
                    icon: <ExclamationCircleFilled />,
                    //   content: "Some descriptions",
                    onOk: async () => {
                      if (record.username) {
                        const res: any = await deleteUser({
                          username: record.username,
                        });
                        messageApi.open({
                          type: "success",
                          content: "删除成功",
                        });
                        if (res.code === 0) {
                          initialData();
                        }
                      }
                    },
                  });
                }}
              >
                删除
              </Typography.Link>
            )}
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: UserParams) => ({
        record,
        inputType: col.dataIndex.indexOf("auth") > -1 ? "switch" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Button
        onClick={() => setOpen(true)}
        type="primary"
        style={{ marginBottom: 16 }}
      >
        添加账户
      </Button>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
      <Modal
        title="主题编辑"
        centered
        open={open}
        onOk={() => {
          const putObj = formRef.current?.getFieldsValue();
          handleAdd(putObj);
        }}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <Edit formRef={formRef} />
      </Modal>
      {contextHolder}
    </Form>
  );
};

export default App;
