import http from "../api/http";
import { ChatParams, ChatDetailParams } from "./type";

//get请求
export const login = (data: any) => {
  /**登陆 */
  return http({
    url: "/auth/token",
    method: "post",
    data,
  });
};

export const registerUser = (data: any) => {
  /**添加用户 */
  return http({
    url: "/users/register",
    method: "post",
    data,
  });
};

export const updateUser = (data: any) => {
  /**添加用户 */
  return http({
    url: "/users/update",
    method: "post",
    data,
  });
};

export const deleteUser = (params: { username: string }) => {
  /**添加用户 */
  return http({
    url: "/users/delete",
    method: "get",
    params,
  });
};

export const getUser = () => {
  /**获取个人信息 */
  return http({
    url: "/users/get_user",
    method: "get",
    // params,
  });
};
export const getUserList = () => {
  /**获取用户列表 */
  return http({
    url: "/users/get_list",
    method: "get",
  });
};

export const getUserDetailList = () => {
  /**获取用户管理数据 */
  return http({
    url: "/users/get_list",
    method: "get",
    params: { is_manager: true },
  });
};

export const generate_embedding = () => {
  /** 生成分割文本 */
  return http({
    url: "/demo/generate_embedding",
    method: "get",
  });
};

export const addChat = (data: ChatParams) => {
  /**添加对话 */
  return http({
    url: "/chats/add",
    method: "post",
    data,
  });
};

export const updateChat = (data: ChatParams) => {
  /**添加对话 */
  return http({
    url: "/chats/update",
    method: "post",
    data,
  });
};

export const deleteChat = (params: { id: string }) => {
  /**添加对话 */
  return http({
    url: "/chats/delete",
    method: "get",
    params,
  });
};

export const getChatlist = (params: { topic_id: number }) => {
  /**添加对话 */
  return http({
    url: "/chats/get_list",
    method: "get",
    params,
  });
};

export const getChatDetaillist = (params: { chat_id: string }) => {
  /**添加对话 */
  return http({
    url: "/chats/get_chat_detail_list",
    method: "get",
    params,
  });
};

export const addChatDetail = (data: ChatDetailParams) => {
  /**添加对话 */
  return http({
    url: "/chats/add_chat_detail",
    method: "post",
    data,
  });
};
