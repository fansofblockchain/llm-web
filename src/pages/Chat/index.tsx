import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Avatar,
  Skeleton,
  Button,
  Select,
  Input,
  Row,
  Col,
  message,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useDebouncedCallback } from "use-debounce";
import {
  DeleteOutlined,
  LoadingOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { InputRef } from "antd";
import sendImg from "@/assets/chat/send.svg";
import headerImg from "@/assets/chat/chat-header.png";
import userHeaderImg from "@/assets/chat/userheader.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeDomParse from "rehype-dom-parse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeFormat from "rehype-format";
//@ts-ignore
import getSimilarTextByUrl from "@/api/gpt";
import {
  addChat,
  deleteChat,
  updateChat,
  getChatlist,
  getChatDetaillist,
  addChatDetail,
  initKnowledgeVectorStore,
  getSqlLang,
  getTableNames,
} from "../api";
import { ChatParams } from "../type";
import logoImg from "@/assets/logo.svg";
import LoadingIcon from "@/assets/icons/three-dots.svg";
// import { Markdown } from "./markdown";
import ChatStorageManager from "../team/ChatStorageManager";
import { TITLE, GPT_MODELS } from "./store";
import "./index.less";
import { table } from "console";

// const brandBars = [
//   {
//     label: "Chat对话",
//     key: "chat",
//     icon: "break-word",
//   },
//   {
//     label: "KB知识库",
//     key: "kb_chat",
//     icon: "break-word",
//   },
// ];
const { TextArea } = Input;

interface ChatModel {
  history: HistoryItem[];
  id: string;
  is_query: boolean;
  question: string;
  model?: string;
}

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistory {
  chat: HistoryItem[];
  kb_chat: HistoryItem[];
}

declare global {
  interface Document {
    requestFullscreen: Function;
    cencelFullscreen: Function;
    mozCancelFullScreen: Function;
    mozRequestFullScreen: Function;
    webkitRequestFullscreen: Function;
    msRequestFullscreen: Function;
    webkitExitFullscreen: Function;
    msExitFullscreen: Function;
  }
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = useCallback(() => {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => dom.scrollTo(0, dom.scrollHeight));
    }
  }, []);

  // auto scroll
  useEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

function isTimestamp(value: any) {
  // Check if the value is a number
  if (typeof value !== "number" || value.toString().length != 13) {
    return false;
  }

  // Check if the value is a valid timestamp
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function convertTimestampToDateFormat(timestamp: any) {
  const date = new Date(timestamp);
  // Format the date to the desired format (e.g., "YYYY-MM-DD HH:mm:ss")
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
  return formattedDate;
}

const Chat = (props: { topic_id?: number }) => {
  const { topic_id } = props;
  const [list, setList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const inputRef = useRef<InputRef>(null);
  const [model, setModel] = useState("v2");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiResponseLoading, setAiResponseLoading] = useState(false);
  const [chatList, setChatList] = useState<HistoryItem[]>([]);
  const [selectChatId, setSelectChatId] = useState("temp_id");
  const [operateType, setOperateType] = useState("view");
  const [chatName, setChatName] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableOptions, setTableOptions] = useState<any>([]);
  const [tableName, setTableName] = useState("");

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const initData = async () => {
    setLoading(true);
    if (typeof topic_id === "number" && topic_id > -1) {
      // Dismiss manually and asynchronously

      if (topic_id != 0) {
        messageApi.open({
          type: "loading",
          content: "主题初始化中...",
          duration: 0,
        });
        const resInit: any = await initKnowledgeVectorStore({
          topic_id: topic_id,
          force: false,
        });
        if (resInit.code === 0) {
          messageApi.open({
            type: "success",
            content: "主题初始化成功",
          });
        }
        setTimeout(() => messageApi.destroy(), 2000);
      }
      messageApi.open({
        type: "loading",
        content: "开始加载对话",
      });
      const res: any = await getChatlist({ topic_id: topic_id });
      if (res.code === 0) {
        setList(res.data);
        messageApi.open({
          type: "success",
          content: "对话加载成功",
        });
        if (res.data.length > 0) {
          setSelectChatId(res.data[0].id);
          handleChangeChat(res.data[0].id);
        } else {
          setChatList([]);
        }
      }
      if (tableOptions.length === 0) {
        const res_table = await getTableNames();
        if (res_table.data && res_table.data.length > 0) {
          let newOptions: any = [];
          res_table.data.forEach((tableName: string) => {
            newOptions.push({
              value: tableName,
              label: tableName,
            });
          });
          setTableName(newOptions[0].value);
          setTableOptions(newOptions);
        }
      }
    } else {
      setChatList([]);
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (chatList.length > 0 && chatList[chatList.length - 1].role === "user") {
      setQuestion("");
      generateChat(chatList);
    }
  }, [chatList]);

  useEffect(() => {
    setModel("v2");
    initData();
  }, [topic_id]);

  useEffect(() => {
    setQuestion("");
  }, [topic_id, selectChatId]);

  const targetRef = useRef(null);

  const cancelZoom = () => {
    const targetElement = targetRef.current;
    if (targetElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleZoom = () => {
    const targetElement: Document = targetRef.current || document;
    if (targetElement) {
      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen();
      } else if (targetElement.mozRequestFullScreen) {
        targetElement.mozRequestFullScreen();
      } else if (targetElement.webkitRequestFullscreen) {
        targetElement.webkitRequestFullscreen();
      } else if (targetElement.msRequestFullscreen) {
        targetElement.msRequestFullscreen();
      }
    }
  };

  async function generateChat(messages: HistoryItem[]) {
    setAiResponseLoading(true);
    let history: HistoryItem[] =
      messages.length > 7 ? messages.slice(-7) : [...messages]; // 只发最近的三次对话+提问
    const questionMsg: HistoryItem | undefined = history.pop();
    // 获取结构化数据库
    const data: ChatModel = {
      id: selectChatId,
      is_query: topic_id === 0 ? false : true,
      question: questionMsg ? questionMsg.content : "",
      history: [],
      model: model,
    };
    let allTexts = "";
    try {
      // 新增对话
      let newSelectChatId = selectChatId;
      if (selectChatId === "temp_id") {
        newSelectChatId = await handleOpreate({
          id: selectChatId,
          name: questionMsg ? questionMsg.content.slice(0, 15) : "新增对话",
        });
      }
      const getChunk = (text: any, status: "loading" | "ended") => {
        console.log("selectChatId>>>>", selectChatId);
        if (status === "ended") {
          setAiResponseLoading(false);
          setChatList([
            ...chatList,
            {
              role: "assistant",
              content: allTexts,
            },
          ]);
          setAiResponse("");
          addChatDetail({
            chat_id: newSelectChatId,
            content: allTexts,
            send: "ASSISTANT",
          });
        } else {
          if (text) {
            allTexts = text;
            setAiResponse(allTexts.replaceAll("�", ""));
          }
        }
      };
      debugger;
      if (model === "sqlgpt" && tableName !== "项目投资pdf") {
        console.log("sql模式>>>>");
        if (!tableName) {
          setChatList([
            ...chatList,
            {
              role: "assistant",
              content: "请先选择需要查询的数据库",
            },
          ]);
          return;
        }
        const res: any = await getSqlLang({
          ...data,
          id: newSelectChatId,
          topic_id,
          table_name: tableName,
        });
        const str_data = JSON.stringify(res.data);

        allTexts = `>>>Text2sql>>>${str_data}`;
        setAiResponseLoading(false);
        setChatList([
          ...chatList,
          {
            role: "assistant",
            content: allTexts,
          },
        ]);
        setAiResponse("");
        addChatDetail({
          chat_id: newSelectChatId,
          content: allTexts,
          send: "ASSISTANT",
        });
      } else {
        await getSimilarTextByUrl(
          { ...data, id: newSelectChatId, topic_id, table_name: tableName },
          getChunk
        );
      }
    } catch (error) {
      setChatList([
        ...chatList,
        {
          role: "assistant",
          content: "Error:: 服务器加载失败",
        },
      ]);
      setAiResponse("");
      setAiResponseLoading(false);
    }
  }

  // id?: string;
  // name?: string;
  // decription?: string;
  // topic_id?: number;
  // user_id?: number;
  const handleOpreate = async (chat: ChatParams) => {
    if (!topic_id && topic_id !== 0) {
      return;
    }
    let res: any;
    let newList: any = [...list];
    if (chat.id === "temp_id") {
      res = await addChat({ name: chat.name, topic_id, decription: "" });
      if (res.code === 0) {
        newList.unshift(res.data);
        setSelectChatId(res.data.id);
        setOperateType("view");
        setList(newList);
        return res.data.id; //新增时返回chat_id
      }
    } else if (operateType === "edit") {
      res = await updateChat({ ...chat, name: chatName });
      if (res.code === 0) {
        newList.forEach((item: any) => {
          if (item.id === chat.id) {
            item.name = chatName;
          }
        });
      }
    } else if (operateType === "delete") {
      if (chat.id) {
        res = await deleteChat({ id: chat.id });
        if (res.code === 0) {
          let deleteIndex: number = -1;
          newList.forEach((item: any, index: number) => {
            if (item.id === chat.id) {
              deleteIndex = index;
            }
          });
          if (deleteIndex > -1) {
            newList.splice(deleteIndex, 1);
          }
          setSelectChatId("temp_id");
        }
      }
    }
    setOperateType("view");
    setList(newList);
  };

  const handleSubmit = () => {
    if (aiResponseLoading) {
      return;
    }
    if (typeof topic_id === "undefined" || topic_id < 0) {
      messageApi.open({
        type: "warning",
        content:
          "请先选择主题,若团队下没有主题，请联系团队负责人进行增加，或使用其他团队！",
      });
      return;
    }
    setAutoScroll(true);
    setChatList([
      ...chatList,
      {
        role: "user",
        content: question,
      },
    ]);
  };

  async function handleChangeChat(chat_id: string) {
    if (chat_id === "temp_id") {
      setChatList([]);
      return;
    }
    const res: any = await getChatDetaillist({ chat_id });
    if (res.code === 0 && Array.isArray(res.data)) {
      res.data.forEach((item: any) => {
        item.role = item.send.toLowerCase();
      });
      setChatList(res.data);
    }
  }
  // function scrollToBottom() {
  //   var chatContainer = document.getElementById("chat-box");
  //   if (chatContainer) {
  //     chatContainer.scrollTop = chatContainer.scrollHeight;
  //   }
  // }

  const texts = [
    "问一个研发问题",
    "查一个研发数据",
    "给一个分析对比结果",
  ];

  const JarvixMd = (content: string) => {
    let tableDom: any;
    if (content.startsWith(">>>Text2sql>>>")) {
      let table_obj;
      try {
        table_obj = JSON.parse(content.replaceAll(">>>Text2sql>>>", ""));
      } catch (error) {
        return null
      }
      const { list, sql } = table_obj;
      if (list && list.length > 0) {
        const columns: ColumnsType<any> = [];
        Object.keys(list[0]).forEach((key: string) => {
          columns.push({
            title: TITLE.user[`${key}`] || key,
            dataIndex: key,
            key: key,
            ellipsis: true,
            render: (text: any) => (
              <span>
                {isTimestamp(text) ? convertTimestampToDateFormat(text) : text}
              </span>
            ),
          });
        });
        tableDom = (
          <Table scroll={{ x: true }} columns={columns} dataSource={list} />
        );
      } else {
        tableDom = <h4>查询不到任何数据</h4>;
      }

      return (
        <div>
          {tableDom}
          <p>数据来源于: {sql}</p>
        </div>
      );
    }
    let url = "";
    if (content.indexOf("[jarvix_pic_url]")) {
      let arr = content.split("[jarvix_pic_url]");
      content = arr[0];
      url = arr[1];
    }
    return (
      <>
        {/* {table} */}
        <ReactMarkdown
          remarkPlugins={[
            [remarkGfm, { tableCellPadding: true, tablePipeAlign: true }],
            remarkMath,
          ]}
          rehypePlugins={[
            // rehypeKatex,
            // rehypeDomParse,
            rehypeFormat,
          ]}
          // remarkPlugins={[remarkGfm, remarkParse, remarkRehype]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, "")}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
          }}
          children={content}
        />
        {url && (
          <img
            style={{ height: "200px" }}
            src={`https://sgpt-ctt.oss-cn-shenzhen.aliyuncs.com${url}`}
            alt=""
          />
        )}
      </>
    );
  };
  return (
    <div id="chat-list">
      {contextHolder}
      <div
        style={{
          position: "absolute",
          width: "500px",
          right: "260px",
          top: "10px",
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
        }}
      >
        问答模式：
        <Select
          style={{ marginRight: "16px", width: "100px" }}
          value={model}
          onChange={(value) => {
            if (value === "sqlgpt" && !tableName) {
              setTableName(tableOptions[0].value);
            }
            setModel(value);
          }}
          options={GPT_MODELS(topic_id)}
          placeholder="请选择团队"
        />
        {model === "sqlgpt" && (
          <>
            选择文件
            <Select
              value={tableName}
              onChange={(value) => setTableName(value)}
              style={{ marginLeft: "16px", width: 140 }}
              options={tableOptions}
            />
          </>
        )}
      </div>

      <div className="chat-content">
        <div className="chat-l">
          {[
            {
              name: "New Chat",
              id: "temp_id",
            },
            ...list,
          ].map((item) => (
            <Card
              style={{
                width: 270,
                height: 44,
                margin: "15px 15px 0 15px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: item.id === selectChatId ? "" : "#000000",
              }}
              onClick={() => {
                if (aiResponseLoading || loading) {
                  return;
                }
                setSelectChatId(item.id);
                handleChangeChat(item.id);
              }}
            >
              <div className="l-cont">
                <Skeleton loading={false} avatar>
                  <Avatar className="avatar">
                    {item.id === "temp_id"
                      ? "+"
                      : item && item.name
                      ? item.name[0].toLocaleUpperCase()
                      : ""}
                  </Avatar>
                  <div>
                    <div className="l-title">
                      <div className="l-name">
                        {item.id === selectChatId && operateType === "edit" ? (
                          <Input
                            size="small"
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleOpreate(item);
                              }
                            }}
                          />
                        ) : (
                          item.name
                        )}
                      </div>
                      {item.id === selectChatId && item.id !== "temp_id" && (
                        <div>
                          {operateType === "edit" ||
                          operateType === "delete" ? (
                            <div>
                              <CheckOutlined
                                style={{ margin: "0 8px" }}
                                onClick={() => handleOpreate(item)}
                              />
                              <CloseOutlined
                                onClick={() => setOperateType("view")}
                              />
                            </div>
                          ) : (
                            <div>
                              <EditOutlined
                                style={{ margin: "0 8px" }}
                                onClick={() => {
                                  setOperateType("edit");
                                  setChatName(item.name);
                                }}
                              />
                              <DeleteOutlined
                                onClick={() => setOperateType("delete")}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* <div className="l-description">{item.description}</div> */}
                  </div>
                </Skeleton>
              </div>
            </Card>
          ))}
        </div>
        <div className="chat-r" ref={targetRef}>
          <div className="chat-r-c" id="chat-box" ref={scrollRef}>
            {chatList && chatList.length > 0 ? (
              chatList.map((chatListItem: any) => (
                <div className="c-r-content">
                  <Avatar
                    className="c-avatar"
                    icon={
                      <img
                        src={
                          chatListItem && chatListItem.role === "user"
                            ? userHeaderImg
                            : headerImg
                        }
                        alt=""
                      />
                    }
                  ></Avatar>
                  <div
                    className="c-msg"
                    style={
                      chatListItem && chatListItem.role === "user"
                        ? { background: "#333" }
                        : {}
                    }
                  >
                    {JarvixMd(chatListItem.content)}
                  </div>
                </div>
              ))
            ) : (
              <>
                <Row className="logo-demo">
                  <img className="logo-img" src={logoImg} alt="" />
                </Row>
                {topic_id && topic_id > 0 ? (
                  <Row style={{ margin: 16, textAlign: "center" }}>
                    开始提问吧，可以针对下列主题材料进行提问，若问题不相关，则无法获取到准确回答，请联系管理员上传材料
                    <ChatStorageManager topic_id={topic_id} readonly />
                  </Row>
                ) : (
                  <Row>
                    <Col span={6}></Col>
                    <Col span={6} className="chat-demo-col">
                      <div
                        className="chat-demo-bar"
                        style={{
                          textAlign: "center",
                          fontSize: "16px",
                          marginBottom: "40px",
                        }}
                      >
                        尝试下列案例
                      </div>
                      {texts.map((text) => (
                        <div
                          className="chat-demo-bar"
                          onClick={() => setQuestion(text)}
                        >{`${text} -->`}</div>
                      ))}
                    </Col>
                    <Col span={6} className="chat-demo-col">
                      <div
                        className="chat-demo-bar"
                        style={{
                          textAlign: "center",
                          fontSize: "16px",
                          marginBottom: "40px",
                        }}
                      >
                        模型的能力
                      </div>
                      <div className="chat-demo-bar">
                        {`全面离线部署，无需联网`}
                      </div>
                      <div className="chat-demo-bar">{`私有模型，团队协作`}</div>
                      <div className="chat-demo-bar">{`专业数据，专业问答`}</div>
                    </Col>
                    <Col span={6}></Col>
                  </Row>
                )}
              </>
            )}
            {(aiResponse || aiResponseLoading) && (
              <div className="c-r-content">
                <Avatar
                  className="c-avatar"
                  icon={<img src={headerImg} alt="" />}
                ></Avatar>
                <div className="c-msg">
                  {aiResponse ? (
                    JarvixMd(`${aiResponse}${aiResponseLoading && "|"}`)
                  ) : (
                    // <Markdown
                    //   content={aiResponse}
                    //   loading={aiResponse.length === 0 && aiResponseLoading}
                    // />
                    <img className="send-img" src={LoadingIcon} />
                  )}
                </div>
              </div>
            )}
            {/* <div style={{ width: "100%", height: "200px" }}></div> */}
          </div>
          <TextArea
            className="input-text"
            value={question}
            placeholder="在这里输入试试...， 按 Ctrl + Enter 发送"
            onChange={(e) => setQuestion(e.target.value)}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.keyCode === 13) {
                handleSubmit();
              }
            }}
            autoSize={{ minRows: 2, maxRows: 5 }}
            name=""
            id=""
          />
          <div
            className="send-btn"
            onClick={() => {
              inputRef.current!.focus({
                cursor: "end",
              });
            }}
          >
            {aiResponseLoading ? (
              <img className="send-img" src={LoadingIcon} alt="" />
            ) : (
              <img
                onClick={() => {
                  if (question) {
                    handleSubmit();
                  }
                }}
                src={sendImg}
                className="send-img"
                alt=""
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
