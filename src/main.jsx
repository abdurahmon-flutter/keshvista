import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as React from "react";
import ErrorPage from "./error-page";
import Root from "./Root";
import Dashboard from "./ceo/contents/Dashboard";
import Chats from './ceo/contents/Chats';
import ChatMessaging from './ceo/contents/ChatMessaging'; // Import ChatMessaging page
import Login from './login/Login';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "chats/",
        element: <Chats />,
      },
      {
        path: "chats/:chatName", // Dynamic route for individual chat
        element: <ChatMessaging />, // Use the ChatMessaging component
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
