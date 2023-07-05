import React, { useState, useEffect } from "react";
import { Card, Avatar, Skeleton, Input, Row, Col,message } from "antd";
import {
  DeleteOutlined,
  LoadingOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from "@ant-design/icons";
import sendImg from "@/assets/chat/send.svg";
import headerImg from "@/assets/chat/chat-header.png";
import userHeaderImg from "@/assets/chat/userheader.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
//@ts-ignore
import getSimilarTextByUrl from "@/api/langchain";
import {
  addChat,
  deleteChat,
  updateChat,
  getChatlist,
  getChatDetaillist,
  addChatDetail,
  initKnowledgeVectorStore,
} from "../api";
import { ChatParams } from "../type";
import logoImg from "@/assets/logo.svg";

import "./index.less";

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

const Chat = (props: { topic_id?: number }) => {
  const { topic_id } = props;
  const [list, setList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiResponseLoading, setAiResponseLoading] = useState(false);
  const [chatList, setChatList] = useState<HistoryItem[]>([]);
  const [selectChatId, setSelectChatId] = useState("temp_id");
  const [operateType, setOperateType] = useState("view");
  const [chatName, setChatName] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const initData = async () => {
    setLoading(true);
    if (topic_id || topic_id === 0) {
      messageApi.open({
        type: 'loading',
        content: '主题初始化中...',
        duration: 0,
      });
      // Dismiss manually and asynchronously
      const res: any = await getChatlist({ topic_id: topic_id });
      if (res.code === 0) {
        setList(res.data);
        messageApi.open({
          type: 'success',
          content: '对话加载成功',
        });
        // if (res.data.length > 0) {
        //   setChatList(res.data[0].id);
        // }
      }
      const resInit: any = await initKnowledgeVectorStore({ topic_id: topic_id });
      if (resInit.code === 0) {
        messageApi.open({
          type: 'success',
          content: '主题初始化成功',
        });
      }
      messageApi.destroy()
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
    initData();
  }, [topic_id]);

  // useEffect(() => {
  //   initData();
  // }, [selectChatId]);

  useEffect(() => {
    setQuestion("");
  }, [topic_id, selectChatId]);

  async function generateChat(messages: HistoryItem[]) {
    setAiResponseLoading(true);
    setAiResponse("..");
    let history: HistoryItem[] =
      messages.length > 7 ? messages.slice(-7) : [...messages]; // 只发最近的三次对话+提问
    const questionMsg: HistoryItem | undefined = history.pop();
    // 获取结构化数据库
    const data: ChatModel = {
      id: selectChatId,
      is_query: topic_id === 0 ? false : true,
      question: questionMsg ? questionMsg.content : "",
      history: [],
      model: "v2",
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
      console.log("newSelectChatId", newSelectChatId);
      await getSimilarTextByUrl(
        { ...data, id: newSelectChatId, topic_id },
        (text: any, status: "loading" | "ended") => {
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
            // if (data.model) {
            //   allTexts += text;
            //   setAiResponse(allTexts);
            // } else {
            allTexts = text;
            setAiResponse(text.replaceAll("�", ""));
            // }
          }
        }
      );
    } catch (error) {
      console.log("error", error);
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
    scrollToBottom();
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
  function scrollToBottom() {
    var chatContainer = document.getElementById("chat-box");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  const texts = [
    "写一个关于手机的文案策划",
    "使用Java编写一个小游戏",
    "谈谈未来AI的发展",
  ];

  return (
    <div id="chat-list">
      {contextHolder}
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
        <div className="chat-r">
          <div className="chat-r-c" id="chat-box">
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
                  <div className="c-msg">
                    <ReactMarkdown
                      remarkPlugins={[
                        [
                          remarkGfm,
                          { tableCellPadding: true, tablePipeAlign: true },
                        ],
                        remarkMath,
                      ]}
                      rehypePlugins={[rehypeKatex]}
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
                      children={chatListItem.content}
                    />
                  </div>
                </div>
              ))
            ) : (
              <>
                <Row className="logo-demo">
                  <img className="logo-img" src={logoImg} alt="" />
                </Row>
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
              </>
            )}
            {(aiResponse || aiResponseLoading) && (
              <div className="c-r-content" style={{ marginBottom: "100px" }}>
                <Avatar
                  className="c-avatar"
                  icon={<img src={headerImg} alt="" />}
                ></Avatar>
                <div className="c-msg">
                  <ReactMarkdown
                    children={`${aiResponse}${aiResponseLoading && "|"}`}
                  />
                </div>
              </div>
            )}
            <div style={{ width: "100%", height: "200px" }}></div>
          </div>
          <Input
            type="text"
            className="input-text"
            value={question}
            placeholder="在这里输入试试..."
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                handleSubmit();
              }
            }}
            suffix={
              aiResponseLoading ? (
                <LoadingOutlined />
              ) : (
                <img
                  onClick={() => {
                    handleSubmit();
                  }}
                  src={sendImg}
                  className="send-img"
                  alt=""
                />
              )
            }
            name=""
            id=""
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
