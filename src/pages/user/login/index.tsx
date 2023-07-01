import "./index.less";
import React from "react";
import { Button, Form, Input, message } from "antd";
import logoImg from "@/assets/logo.svg";
import bgImg from "@/assets/login_bg.png";
import { login } from "../../api";
import { useNavigate } from "react-router-dom";
import { url } from "inspector";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const onFinish = async (values: any) => {
    const res: any = await login({
      ...values,
      scope: "",
      grant_type: "password",
    });
    if (res.access_token) {
      const { access_token, token_type, expires_in } = res;
      localStorage.setItem("token", access_token); //将token存放到
      localStorage.setItem("username", values.username); //将token存放到
      messageApi.open({
        type: "success",
        content: "登陆成功",
      });
      navigate("/console/chat");
    } else {
      messageApi.open({
        type: "error",
        content: "密码错误",
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const isMobile = window.mobileCheck();
  return (
    <>
      <div>
        {contextHolder}
        <div id="login" className={isMobile ? "mobile-bg" : ""}>
          {!isMobile && (
            <div className="left">
              <div className="left-text">Let AI Serve Everyone</div>
            </div>
          )}
          <div className="right" style={{ width: isMobile ? "100%" : "50%" }}>
            <div
              className={`login-form`}
              // style={
              //   window.mobileCheck()
              //     ? { padding: "0 24px 48px 24px" }
              //     : {
              //         // position: "fixed",
              //         backgroundColor: "#242424",
              //         // right: "180px",
              //         // padding: "24px",
              //       }
              // }
            >
              <div className="logo">
                <img className="logo-img" src={logoImg} alt="" />
              </div>
              <Form
                name="basic"
                style={{ width: "100%" }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                size="large"
              >
                <Form.Item
                  name="username"
                  style={{ padding: "8px 0" }}
                  rules={[{ required: true, message: "请输入账号!" }]}
                >
                  <Input placeholder="用户名" />
                </Form.Item>

                <Form.Item
                  name="password"
                  style={{ paddingBottom: "16px" }}
                  rules={[{ required: true, message: "请输入密码!" }]}
                >
                  <Input.Password placeholder="密码" />
                </Form.Item>

                <Form.Item style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%", padding: "8px 0" }}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
