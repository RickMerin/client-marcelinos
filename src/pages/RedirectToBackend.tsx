import { useEffect } from "react";

const RedirectToBackend = () => {
  useEffect(() => {
    // EDIT THIS URL TO YOUR BACKEND LOGIN PAGE
    const backendLoginUrl = "http://127.0.0.1:8000/login";
    
    window.location.href = backendLoginUrl;
  }, []);

  return null;
};

export default RedirectToBackend;
