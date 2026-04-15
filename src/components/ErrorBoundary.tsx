import { Component, ReactNode } from "react";
import { reportClientError } from "@/lib/monitoring/reportClientError";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		if (import.meta.env.DEV) {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}
		reportClientError({
			message: error.message || String(error),
			stack: error.stack ?? undefined,
			source: "react-error-boundary",
			component_stack: errorInfo.componentStack ?? undefined,
		});
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
						<div className="mb-4">
							<svg
								className="mx-auto h-12 w-12 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Oops! Something went wrong
						</h1>
						<p className="text-gray-600 mb-6">
							We're sorry for the inconvenience. Please refresh the page or try
							again later.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
							Refresh Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
