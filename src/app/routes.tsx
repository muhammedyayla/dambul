import { createBrowserRouter, redirect } from "react-router";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { CustomizeProfileScreen } from "./screens/CustomizeProfileScreen";
import { MapScreen } from "./screens/MapScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { isAuthed } from "./auth";

function requireAuth() {
  if (!isAuthed()) {
    throw redirect("/");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginScreen,
  },
  {
    path: "/register",
    Component: RegisterScreen,
  },
  {
    path: "/customize-profile",
    Component: CustomizeProfileScreen,
  },
  {
    path: "/map",
    Component: MapScreen,
    loader: requireAuth,
  },
  {
    path: "/profile/:userId",
    Component: ProfileScreen,
    loader: requireAuth,
  },
]);