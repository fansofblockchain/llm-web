import http from "../../api/http";

import { TeamParams, TopicParams, TeamUserParams } from "./type";

/**
 * 新接口
 * */

/**
 * 主题编辑接口
 */

export const addTopic = (params: TopicParams) => {
  /**新增主题 */
  return http({
    url: "/topics/add",
    method: "post",
    data: params,
  });
};

export const updateTopic = (params: TopicParams) => {
  /**新增主题 */
  return http({
    url: "/topics/update",
    method: "post",
    data: params,
  });
};

export const getTopicDetail = (params: { id: number }) => {
  /**新增主题 */
  return http({
    url: "/topics/get_detail",
    method: "get",
    params,
  });
};

export const getTopicList = (params: { team_id: number }) => {
  /**主题列表 */
  return http({
    url: "/topics/get_list",
    method: "get",
    params,
  });
};

/**
 * 团队编辑接口
 */

export const addTeam = (params: TeamParams) => {
  /**新增团队 */
  return http({
    url: "/team/add",
    method: "post",
    data: params,
  });
};

export const updateTeam = (params: TeamParams) => {
  /**新增团队 */
  return http({
    url: "/team/update",
    method: "post",
    data: params,
  });
};

export const getTeamDetail = (params: { id: number }) => {
  /**新增团队 */
  return http({
    url: "/team/get_detail",
    method: "get",
    params,
  });
};

export const getTeamList = (params: { is_manager: boolean }) => {
  /**团队列表 */
  return http({
    url: "/team/get_list",
    method: "get",
    params,
  });
};

/**
 * 团队成员接口
 */

export const addTeamUser = (params: any) => {
  /**新增成员 */
  return http({
    url: "/team/add_user",
    method: "post",
    data: params,
  });
};

export const updateTeamUser = (params: TeamUserParams) => {
  /**更新成员 */
  return http({
    url: "/team/update_user",
    method: "post",
    data: params,
  });
};

export const deleteTeamUser = (params: TeamUserParams) => {
  /**更新成员 */
  return http({
    url: "/team/delete_user",
    method: "post",
    data: params,
  });
};

export const getTeamRole = (params: { team_id: number }) => {
  /**查询权限 */
  return http({
    url: "/team/get_role",
    method: "get",
    params,
  });
};

export const getTeamUserList = (params: { team_id: number }) => {
  /**获取团队成员 */
  return http({
    url: "/team/get_user_list",
    method: "get",
    params,
  });
};
