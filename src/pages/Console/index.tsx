import { useState, useEffect } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider, Button } from "antd";
import "./index.less";
import logoImg from "@/assets/logo.svg";
import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { getUser } from "../api";


const { defaultAlgorithm, darkAlgorithm } = theme;
const { Header, Content, Sider } = Layout;

const menus = [
  {
    key: "team",
    icon: LaptopOutlined,
    label: "团队管理",
    children: [
      {
        key: "list",
        icon: "",
        label: "我的团队",
      },
      {
        key: "manager",
        icon: "",
        label: "团队管理",
      },
    ],
  },

  {
    key: "account",
    icon: NotificationOutlined,
    label: "用户管理",
    children: [
      {
        key: "user-list",
        icon: "",
        label: "用户列表",
      },
    ],
  },
];

const items2: MenuProps["items"] = menus.map((menu, index) => {
  return {
    key: menu.key,
    icon: React.createElement(menu.icon),
    label: menu.label,
    children: menu.children.map((menu_child, j) => {
      return {
        key: menu_child.key,
        label: menu_child.label,
      };
    }),
  };
});

const LayoutContainer: React.FC = () => {
  const isMobile = window.mobileCheck();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(isMobile ? true : false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [selectMenu, setSelectMenu] = useState(["list"]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  let crumbs: any;
  menus.forEach((menu) => {
    menu.children.forEach((menu_child) => {
      if (menu_child.key === selectMenu[0]) {
        crumbs = [{ title: menu.label }, { title: menu_child.label }];
      }
    });
  });

  useEffect(() => {
    const res = getUser();
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (menu: any) => {
    setSelectMenu([menu.key]);
    if (menu.keyPath.length > 1) {
      navigate("/console/" + menu.keyPath[1] + "/" + menu.keyPath[0]);
      if (isMobile) {
        toggleCollapsed();
      }
    }
  };

  const handleThemeClick = () => {
    setIsDarkMode((previousValue) => !previousValue);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div id="console-container" style={{ height: "100vh", width: "100vw" }}>
        <Layout style={{ height: "100vh", width: "100vw" }}>
          <Header className="header">
            <div className="logo" onClick={() => navigate("/login")}>
              <img className="logo-img" src={logoImg} alt="" />
            </div>
            {/* <Button onClick={handleThemeClick}>
              {isDarkMode ? "浅色" : "暗黑"}主题
            </Button> */}
            <Button onClick={() => navigate("/")}>开启对话</Button>
            {/* <Menu mode="horizontal" defaultSelectedKeys={["2"]} items={items1} /> */}
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
            {/* {!collapsed && ( */}
            <Sider
              width={collapsed ? 0 : 200}
              style={{
                background: colorBgContainer,
                left: collapsed ? -200 : 0,
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={selectMenu}
                onClick={handleMenuClick}
                defaultOpenKeys={["app-manager"]}
                style={{ height: "100%", borderRight: 0 }}
                items={items2}
              />
            </Sider>
            {/* )} */}

            <Layout style={{ padding: "0 24px 24px" }}>
              {!isMobile && (
                <Breadcrumb style={{ margin: "16px 0" }} items={crumbs}>
                  {/* <Breadcrumb.Item key={crumbs[0]}>
                  {crumbs ? crumbs[0] : ""}
                </Breadcrumb.Item>
                <Breadcrumb.Item key={crumbs[1]}>
                  {crumbs ? crumbs[1] : ""}
                </Breadcrumb.Item> */}
                </Breadcrumb>
              )}
              <Content
                style={{
                  margin: 0,
                  minHeight: 280,
                  overflow: "auto",
                }}
              >
                <Outlet />
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
};

export default LayoutContainer;
