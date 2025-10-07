// src/routes/route.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));

export const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  //   { path: "*", component: NotFound },

  // Developer individual pages
];
