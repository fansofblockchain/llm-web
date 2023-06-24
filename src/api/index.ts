import http from "./http";

//get请求
export const getTest = (params: any) => {
  return http({
    url: "/test",
    method: "get",
    params,
  });
};
//post请求
export const postTest1 = (data: any) => {
  return http({
    url: "/test1",
    method: "post",
    data,
  });
};
