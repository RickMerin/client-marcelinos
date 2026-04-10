import "./assets/styles/App.css";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes/route";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollNav from "./components/ScrollNav";
import { Spinner } from "./components/ui/spinner";
import ErrorBoundary from "./components/ErrorBoundary";
import { useRealtimeGlobalSubscriber } from "@/hooks/useRealtimeGlobalSubscriber";
import { ToastContainer } from "react-toastify";
import { API } from "./lib/api/apiClient";
import { endpoints } from "./lib/api/endpoints";
import MaintenanceMode from "./pages/MaintenanceMode";

// Layout component to wrap pages with consistent structure
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="w-full h-full grow">{children}</main>
      <Footer />
      <ScrollNav />
    </div>
  );
};

const App = () => {
  useRealtimeGlobalSubscriber();
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    badge: "Scheduled Maintenance",
    title: "We are improving your experience",
    description:
      "Our website is currently under maintenance. Please check back again shortly.",
    eta: "",
  });

  useEffect(() => {
    let active = true;

    const fetchMaintenanceMode = async () => {
      try {
        const response = await API.get<{
          success: boolean;
          data: {
            enabled: boolean;
            badge: string;
            title: string;
            description: string;
            eta: string;
          };
        }>(endpoints.maintenanceMode);

        if (!active || !response?.data) {
          return;
        }

        setMaintenance({
          enabled: !!response.data.enabled,
          badge: response.data.badge || "Scheduled Maintenance",
          title: response.data.title || "We are improving your experience",
          description:
            response.data.description ||
            "Our website is currently under maintenance. Please check back again shortly.",
          eta: response.data.eta || "",
        });
      } catch {
        if (active) {
          setMaintenance((previous) => ({ ...previous, enabled: false }));
        }
      } finally {
        if (active) {
          setIsLoadingMaintenance(false);
        }
      }
    };

    fetchMaintenanceMode();

    return () => {
      active = false;
    };
  }, []);

  if (isLoadingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Spinner />
      </div>
    );
  }

  if (maintenance.enabled) {
    return (
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route
              path="/maintenance"
              element={
                <MaintenanceMode
                  badge={maintenance.badge}
                  title={maintenance.title}
                  description={maintenance.description}
                  eta={maintenance.eta}
                />
              }
            />
            <Route path="*" element={<Navigate to="/maintenance" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/maintenance" element={<Navigate to="/" replace />} />
            {routes.map(({ path, component: Component }, index) => (
              <Route
                key={index}
                path={path}
                element={
                  <Layout>
                    <Component />
                  </Layout>
                }
              />
            ))}
          </Routes>
        </Suspense>
      </Router>
      <ToastContainer
        newestOnTop
        pauseOnFocusLoss={false}
        limit={3}
      />
    </ErrorBoundary>
  );
};

export default App;
