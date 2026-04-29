import { lazy } from "react";
import Home from "../pages/Home/Index";

// Home is eager-loaded so the landing page renders immediately; other routes stay lazy
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Booking = lazy(() => import("../pages/Booking/Index"));
const Testimonial = lazy(() => import("../pages/Testimonial/Index"));
const Terms = lazy(() => import("../pages/Terms"));
const RulesandRegulation = lazy(() => import ("../pages/RulesandRegulations.tsx"))
const RefundPolicy = lazy(() => import("../pages/RefundPolicy.tsx"));
const SinglePage = lazy(() => import("../pages/SinglePage"));
const RedirectToBackend = lazy(() => import("../pages/RedirectToBackend"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const BillingStatement = lazy(() => import("../pages/Billing/BillingStatementPage"));

export const routes = [
  { path: "/login", component: RedirectToBackend },
  { path: "/", component: Home },
  { path: "/testimonial", component: Testimonial },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/terms-and-conditions", component: Terms },
  {path: "/rules-regulation", component: RulesandRegulation },
  { path: "/refund-policy", component: RefundPolicy },
  { path: "/blog", component: Blog },
  { path: "/blog/:slug", component: BlogPost },
  { path: "/create-booking", component: Booking },
  {
    path: "/booking-receipt/:receipt_token",
    component: Booking,
    current_step: 5,
  },
  { path: "/billing/:id", component: BillingStatement },
  { path: "/rooms", component: SinglePage },
  { path: "/rooms/:roomId", component: SinglePage },
  { path: "/venues", component: SinglePage },
  { path: "/venues/:venueId", component: SinglePage },
  { path: "*", component: NotFound },
];
