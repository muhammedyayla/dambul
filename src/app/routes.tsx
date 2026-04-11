import { createBrowserRouter } from "react-router";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { SwipeScreen } from "./screens/SwipeScreen";
import { ChatListScreen } from "./screens/ChatListScreen";
import { ChatThreadScreen } from "./screens/ChatThreadScreen";
import { SceneFeedScreen } from "./screens/SceneFeedScreen";
import { ScenePostScreen } from "./screens/ScenePostScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { loginLoader, onboardingLoader, requireSession, rootLoader } from "./loaders/authLoaders";

export const router = createBrowserRouter([
  { path: "/", loader: rootLoader },
  { path: "/login", Component: LoginScreen, loader: loginLoader },
  {
    path: "/onboarding",
    Component: OnboardingScreen,
    loader: onboardingLoader,
  },
  {
    path: "/map",
    Component: MapScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/swipe",
    Component: SwipeScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/chat",
    Component: ChatListScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/chat/:threadId",
    Component: ChatThreadScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/scene",
    Component: SceneFeedScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/scene/:postId",
    Component: ScenePostScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/notifications",
    Component: NotificationsScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/profile/:userId",
    Component: ProfileScreen,
    loader: ({ request }) => requireSession(request),
  },
  {
    path: "/settings",
    Component: SettingsScreen,
    loader: ({ request }) => requireSession(request),
  },
]);
