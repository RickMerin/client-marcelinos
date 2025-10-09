// src/routes/route.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "*", component: NotFound },
];
