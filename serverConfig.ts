let baseURL = "";
switch (
  process.env.NODE_ENV //可以在根目录的 package.json 配置 NODE_ENV
) {
  case "production":
    baseURL = "http://web.responds.top";
    // baseURL = "http://btcxinghao.com";
    // baseURL = "https://signarl.com";
    break;
  case "development":
    baseURL = "http://web.responds.top";
    break;
  default:
    baseURL = "http://web.responds.top";
}
const serverConfig: any = {
  baseURL: baseURL, // 请求基础地址,可根据环境自定义
  useTokenAuthorization: true, // 是否开启 token 认证
};
export default serverConfig;
