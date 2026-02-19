// src/routes/route.ts
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home/Index"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Booking = lazy(() => import("../pages/Booking/Index"));
const Testimonial = lazy(() => import("../pages/Testimonial/Index"));
const Terms = lazy(() => import("../pages/Terms"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy.tsx"));

export const routes = [
  { path: "/", component: Home },
  { path: "/testimonial", component: Testimonial },
  { path: "*", component: NotFound },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/terms-and-conditions", component: Terms },
  { path: "/refund-policy", component: RefundPolicy },
  { path: "/create-booking", component: Booking },
  {
    path: "/booking-receipt/:reference_number",
    component: Booking,
    current_step: 5,
  },
];
