export interface TeamParams {
  id?: number;
  decription?: string;
  name?: string;
  state?: string;
  team_id?: number;
}

export interface TopicParams {
  id?: number;
  decription?: string;
  name?: string;
  team_id?: number;
}

export interface TopicDetail {
  id?: number;
  decription?: string;
  name?: string;
  team_id?: number;
}

export interface TeamUserParams {
  id?: number;
  role_id?: number;
  user_id?: number;
  team_id?: number;
  username?:string
  nickname?:string
}
