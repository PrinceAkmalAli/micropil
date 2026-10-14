import { useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar, Footer } from "./components";
import { Home, Procedures, Results, Contact, Portal } from "./pages";
import { Login, Dashboard } from "./admin";

const Page = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.45 }}
  >
    {children}
  </motion.main>
);

export default function App() {
  const loc = useLocation();
  const admin = loc.pathname.startsWith("/admin");

  // FIXED: Added curly brackets so it doesn't implicitly return undefined
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    const m = (e) => {
      const c = e.target.closest?.(".card");
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      }
    };
    document.addEventListener("mousemove", m);
    return () => document.removeEventListener("mousemove", m);
  }, []);

  return (
    <>
      {!admin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname}>
          <Route
            path="/"
            element={
              <Page>
                <Home />
              </Page>
            }
          />
          <Route
            path="/services"
            element={
              <Page>
                <Procedures />
              </Page>
            }
          />
          <Route
            path="/results"
            element={
              <Page>
                <Results />
              </Page>
            }
          />
          <Route
            path="/portal"
            element={
              <Page>
                <Portal />
              </Page>
            }
          />
          <Route
            path="/contact"
            element={
              <Page>
                <Contact />
              </Page>
            }
          />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <Page>
                <div className="page-h">
                  <h2>Page not found</h2>
                  <Link className="btn" to="/">
                    Back to home
                  </Link>
                </div>
              </Page>
            }
          />
        </Routes>
      </AnimatePresence>
      {!admin && (
        <>
          <Footer />
          <Link className="fab" to="/contact">
            Book Appointment
          </Link>
        </>
      )}
    </>
  );
}
