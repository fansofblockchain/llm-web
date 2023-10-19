import { Navigate } from "react-router-dom";

import Layout from "./pages/Layout";
import Console from "./pages/Console";
import Login from "./pages/user/login";
import Chat from "./pages/Chat";
import Register from "./pages/user/register";
import TeamList from "./pages/team/list";
import AccountList from "./pages/account/list";
import TeamManager from "./pages/team/manager";

export const routers = [
  {
    path: "/",

    element: <Layout />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/chat",
    element: <Layout />,
  },
  {
    path: "/console",
    element: <Console />,
    children: [
      {
        path: "team",
        children: [
          { path: "list", element: <TeamList /> },
          { path: "manager", element: <TeamManager /> },
        ],
      },
      {
        path: "account",
        children: [{ path: "user-list", element: <AccountList /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
