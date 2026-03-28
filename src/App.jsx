import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Loader from "./components/ui/loader";
import ProtectedRoute from "./components/global/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import Legal from "./pages/Legal";   
import NotFound from "./pages/NotFound";
import VerifyFirebase from "./pages/VerifyFirebase";

// Components
import Navbar from "./components/global/Navbar";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="light-theme min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
        <Navbar />
        <main className="page-shell py-8">
          <div className="container-shell section-stack">
            <Routes>
              <Route path="/verify-firebase" element={<VerifyFirebase />} />

              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis/:id"
                element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/legal"
                element={
                  <ProtectedRoute>
                    <Legal />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
