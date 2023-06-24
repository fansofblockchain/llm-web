export interface UserParams {
  id?: number;
  key: string;
  team_auth: 0 | 1;
  user_auth: 0 | 1;
  username?: string;
  nickname?: string;
  state: string;
  password: string;
}

export type resParams<T> = {
  code: number;
  data: T;
  message: string;
};

export interface ChatParams {
  id?: string;
  name?: string;
  decription?: string;
  topic_id?: number;
  user_id?: number;
}
