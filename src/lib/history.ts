import { createBrowserHistory } from "history";

/**
 * Shared browser history instance created using the history package.
 * This can be used for programmatic navigation and history manipulation
 * throughout the application.
 * 
 * Note: When using React Router v6+, it's recommended to use useNavigate hook
 * for navigation within components. This history instance is useful for:
 * - Navigation outside of React components
 * - Accessing history state and location
 * - Custom history management scenarios
 */
export const browserHistory = createBrowserHistory();
