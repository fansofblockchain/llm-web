import { useState, useEffect } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider, Button } from "antd";
import "./index.less";
import logoImg from "@/assets/logo.svg";
import bannerImg from "@/assets/chat/banner_font.svg";
import React from "react";
import { useNavigate } from "react-router-dom";
import Scene from "./scene";
import { generate_embedding, getUser } from "../api";
import Chat from "../Chat";
import TeamSelect from "../components/TeamSelect";
import TopicSelect from "../components/topic";
import localStorageService from "../../utils/LocalStorageService";

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Header, Content, Sider } = Layout;
const menus = [
  {
    key: "app-manager",
    label: "产业发展方向",
  },
  {
    key: "user-manager",
    label: "知识产权",
  },
  {
    key: "sys-manager",
    label: "学术研究",
  },
];

const items2: MenuProps["items"] = menus.map((menu, index) => {
  return {
    key: menu.key,
    // icon: React.createElement(menu.icon),
    label: menu.label,
    // children:
    //   menu &&
    //   menu.children &&
    //   menu.children.map((menu_child, j) => {
    //     return {
    //       key: menu_child.key,
    //       label: menu_child.label,
    //     };
    //   }),
  };
});

const LayoutContainer: React.FC = () => {
  const isMobile = window.mobileCheck();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(isMobile ? true : false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectTeam, setSelectTeam] = useState<number>();
  const [topic_id, setTopicId] = useState<number>();

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [selectMenu, setSelectMenu] = useState(["list"]);

  useEffect(() => {
    initUser();
  }, []);

  async function initUser() {
    const res: any = await getUser();
    localStorageService.setItem("user", res.data);
  }

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleSelectTeam = (value: number) => {
    setSelectTeam(value);
  };
  const handleMenuClick = (menu: any) => {
    if (menu.key === "add") {
      setOpenAdd(true);
      return;
    }
    setSelectMenu([menu.key]);
    if (menu.keyPath.length > 1) {
      // navigate("/console/" + menu.keyPath[1] + "/" + menu.keyPath[0]);
      if (isMobile) {
        toggleCollapsed();
      }
    }
  };

  const updateScene = () => {
    setOpenAdd(false);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
      <div id="layout-container" style={{ height: "100%", width: "100%" }}>
        <Layout style={{ height: "100vh", width: "100vw" }}>
          <Header className="header">
            <div className="logo" onClick={() => navigate("/login")}>
              <img className="logo-img" src={logoImg} alt="" />
            </div>
            <div className="team-select">
              <TeamSelect
                is_manager={false}
                value={selectTeam}
                onChange={handleSelectTeam}
              />
            </div>
            <Button onClick={() => navigate("/console/team/list")}>
              管理团队
            </Button>
            <div
              className="user-box"
              onClick={() => {
                // generate_embedding();
              }}
            >
              <UserOutlined className="user-icon" />
            </div>
            {/* <Button onClick={handleThemeClick}>角色</Button> */}
          </Header>
          <Layout>
            <Button
              type="primary"
              onClick={toggleCollapsed}
              size="small"
              style={{
                marginBottom: 16,
                position: "absolute",
                bottom: 15,
                left: 15,
                zIndex: 999,
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            {selectTeam !== 0 && (
              <Sider
                width={collapsed ? 0 : 200}
                style={{
                  background: "#0D0D0D",
                  left: collapsed ? -200 : 0,
                }}
              >
                <TopicSelect
                  team_id={selectTeam}
                  topic_id={topic_id}
                  setTopicId={setTopicId}
                  readonly={true}
                />
              </Sider>
            )}

            <Layout style={{ padding: "18px 24px 18px 24px" }}>
              <Content
                style={{
                  margin: 0,
                  minHeight: 280,
                  overflow: "auto",
                }}
              >
                <div className="c-banner">
                  {/* <img src={bannerImg} alt="" /> */}
                </div>
                <div className="c-chat">
                  <Chat topic_id={selectTeam === 0 ? 0 : topic_id} />
                </div>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>
      <Scene open={openAdd} updateScene={updateScene} />
    </ConfigProvider>
  );
};

export default LayoutContainer;
