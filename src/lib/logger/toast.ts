import { toast as toastify, ToastOptions, Slide, ToastContent } from "react-toastify";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

export interface ToastPayload {
	content: ToastContent;
	options?: ToastOptions;
}

const baseOptions: ToastOptions = {
	position: "top-right",
	autoClose: 3500,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	theme: "colored",
	transition: Slide,
};

const resolveVariantOptions = (variant: ToastVariant): ToastOptions => {
	switch (variant) {
		case "success":
			return { type: "success" };
		case "error":
			return { type: "error" };
		case "warning":
			return { type: "warning" };
		case "info":
			return { type: "info" };
		case "default":
		default:
			return { type: "default" };
	}
};

export const showToast = (variant: ToastVariant, payload: ToastPayload) => {
	const { content, options } = payload;
	const variantOptions = resolveVariantOptions(variant);

	return toastify(content, {
		...baseOptions,
		...variantOptions,
		...(options ?? {}),
	});
};

export const toast = {
	success: (payload: ToastPayload) => showToast("success", payload),
	error: (payload: ToastPayload) => showToast("error", payload),
	warning: (payload: ToastPayload) => showToast("warning", payload),
	info: (payload: ToastPayload) => showToast("info", payload),
	default: (payload: ToastPayload) => showToast("default", payload),
};

export default toast;
