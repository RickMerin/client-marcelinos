/**
 * Spinner exports – backward compatible.
 * For full-page loading (Suspense, receipt, etc.) use PageLoader from loader.tsx.
 * For inline/button/overlay use InlineLoader, ButtonLoader, OverlayLoader from loader.tsx.
 */
export { PageLoader as Spinner } from "./loader";
export { PageLoader, InlineLoader, ButtonLoader, OverlayLoader, SpinnerDot } from "./loader";
export type { LoaderSize } from "./loader";
