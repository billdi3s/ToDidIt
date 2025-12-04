import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Login from "./Login";
import { TimeCanvasPage } from "./components/TimeCanvasPage";
import { useAuth } from "./context/AuthProvider";

// --- RequireAuth Component ---
function RequireAuth({ children }: { children: JSX.Element }) {
  const { session } = useAuth();
  const location = useLocation();

  // If not logged in → redirect to login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected route */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <TimeCanvasPage />
            </RequireAuth>
          }
        />

        {/* Handle unmatched routes explicitly */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
