// src/routes/route.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home/Index"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));

export const routes = [
  { path: "/", component: Home },
  { path: "*", component: NotFound },
  { path: "/privacy-policy", component: PrivacyPolicy },
];
