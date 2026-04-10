import "./assets/styles/App.css";
import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/route";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollNav from "./components/ScrollNav";
import { Spinner } from "./components/ui/spinner";
import ErrorBoundary from "./components/ErrorBoundary";
import { useRealtimeGlobalSubscriber } from "@/hooks/useRealtimeGlobalSubscriber";
import { ToastContainer } from "react-toastify";

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

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<Spinner />}>
          <Routes>
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
