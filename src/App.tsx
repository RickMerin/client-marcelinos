import "./App.css";
import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/route";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import { Spinner } from "./components/ui/spinner";

// Layout component to wrap pages with consistent structure
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="w-full h-full flex-grow py-3">
        <div className="container mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
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
  );
};

export default App;
