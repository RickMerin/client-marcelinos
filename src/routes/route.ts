// src/routes/route.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home/Index"));
const NotFound = lazy(() => import("../pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Booking = lazy(() => import("../pages/Booking/Index"));
const BookingReceipt = lazy(() => import("../pages/Booking/BookingReceipt"));

export const routes = [
  { path: "/", component: Home },
  { path: "*", component: NotFound },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/create-booking", component: Booking },
  { path: "/booking-receipt/:reference_id", component: BookingReceipt }
];
