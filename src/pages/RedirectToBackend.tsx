import { useEffect } from "react";

const RedirectToBackend = () => {
  useEffect(() => {
    const backendLoginUrl = import.meta.env.VITE_BACKEND_LOGIN_URL;
    
    window.location.href = backendLoginUrl;
  }, []);

  return null;
};

export default RedirectToBackend;
