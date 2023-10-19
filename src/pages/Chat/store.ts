export const GPT_MODELS = (topic_id?: number) => [
  {
    value: "v2",
    label: "Jarvix",
  },
  {
    value: "chatgpt",
    label: "Chatgpt",
    disabled: topic_id != 0,
  },
  {
    value: "sqlgpt",
    label: "AskData",
    disabled: topic_id === 0,
  },
];

export const TITLE: any = {
  user: {
    id: "id",
    user_auth: "用户权限",
    team_auth: "团队权限",
    username: "用户名",
    password: "密码",
    cellphone: "电话号码",
    email: "邮箱",
    email_verified_at: "邮箱校验时间",
    state: "状态",
    nickname: "昵称",
    gender: "性别",
    avatar: "头像",
    created_at: "创建时间",
    updated_at: "更新时间",
  },
};
// 问：请根据以下已知内容回答问题。
//                  已知内容：
//                  ----
//                  溶剂清洗主要是利用了溶剂的溶解力除去污染物。采用溶剂清洗，由于其挥发快，溶  解
//  能力强，故对设备要求简单。根据选用的清洗剂，可分为可燃性清洗剂和不可燃性清洗
//  剂，前者主要包括有机烃类和醇类 (如有机烃类、醇类、二醇酯类等 )，后者主要包括氯  代
//  烃和氟代烃类 (如 HCFC 和 HFC 类)等。 https://sgpt -ctt.oss -cn-
//  shenzhen.aliyuncs.com/Picture3.png
//  水基清洗工艺流程包括清洗、漂洗、干燥三个工序。首先用浓度为  2%-10%的水基清  洗剂
//  配合加热、刷洗、喷淋喷射、超声波清洗等物理清洗手段对印刷电路板进行批量清洗
//  然后再用纯水或离子水 (DI 水)进行  2-3 次漂洗，最后进行热风干燥。 https://sgpt -ctt.oss -cn-
//  shenzhen.aliyuncs.com/Picture1.png
//                  ----
//                  用户问题：
//                  溶剂清洗
//                  ----
//                  根据以上已知内容回复以上用户问题，如果已知内容中没有用户问题的答案请注明“根据已知信息无法回答该问题”或 “没有提供足够的相关信息”。
//                  如果已知内容中存在诸如"https://sgpt -ctt.oss -cn-
//  shenzhen.aliyuncs.com/Picture.png"的链接请在末尾附加“可能相关的图片：https://sgpt -ctt.oss -cn-shenzhen.aliyuncs.com/Picture.png”，仅返回离答案最近的一个链接，
//                  请勿添加虚构内容，并使用中文回答。
// `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
// `team_auth` int(2) unsigned DEFAULT 0,
// `user_auth` int(2) unsigned DEFAULT 0,
// `username` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '用户名',
// `password` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '密码',
// `cellphone` varchar(45) CHARACTER SET utf8 DEFAULT NULL COMMENT '手机',
// `email` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '邮箱',
// `email_verified_at` datetime DEFAULT NULL COMMENT '邮箱验证时间',
// `state` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'enabled' COMMENT '状态 enabled disabled',
// `nickname` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '昵称',
// `gender` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT 'unknown' COMMENT '性别 male，female',
// `avatar` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '头像',
// `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
// `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
