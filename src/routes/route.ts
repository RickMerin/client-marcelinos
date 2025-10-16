// src/routes/route.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
const Rooms = lazy(() => import("../pages/Rooms"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const FAQ = lazy(() => import("../pages/FAQ"));


export const routes = [
  { path: "/", component: Home },
  { path: "/room", component: Rooms },
  { path: "*", component: NotFound },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/faq", component: FAQ },
];
