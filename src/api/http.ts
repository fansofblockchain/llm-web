import axios from "axios";
import serverConfig from "../../serverConfig"; //引入配置项文件
import qs from "qs"; //可以对post请求传参进行序列化处理
// 创建 axios 请求实例
const serviceAxios = axios.create({
  baseURL: serverConfig.baseURL + "/api", // 基础请求地址
  timeout: 60000, // 请求超时设置
  withCredentials: false, // 跨域请求是否需要携带 cookie
});

// 创建请求拦截
serviceAxios.interceptors.request.use(
  (config) => {
    // 如果开启 token 认证
    if (serverConfig.useTokenAuthorization) {
      config.headers["Authorization"] = `Bearer ${localStorage.getItem(
        "token"
      )}`; // 请求头携带 token
    } // 设置请求头
    if (!config.headers["content-type"]) {
      // 如果没有设置请求头
      config.headers["content-type"] = "application/json"; // 默认类型
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//响应失败时返回的参数处理
const messageMap: any = {
  302: "接口重定向了！",
  400: "请求参数错误！",
  401: "您未登录，或者登录已经超时，请先登录！",
  403: "您没有权限访问该资源！",
  404: "您访问的资源不存在！",
  500: "服务器内部错误！",
  502: "网关错误！",
  504: "网关超时！",
  default: "异常问题，请联系管理员！",
};
// 创建响应拦截
serviceAxios.interceptors.response.use(
  //响应成功
  (res) => {
    let data = res.data;
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    return data;
  },
  //响应失败
  (error) => {
    if (error && error.response) {
      //使用key:value的形式
      if (error.response.data && error.response.data.code === 401) {
        location.href = "/login";
      }
      return messageMap[error.response.status] || "default";
    }
    //服务器连结果都没有返回
    if (!window.navigator.onLine) {
      //断网处理：跳转断网页面/提示网络错误等等
      return;
    }
  }
);

export default serviceAxios;
