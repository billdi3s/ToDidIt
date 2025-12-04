import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import { TimeCanvasPage } from "./components/TimeCanvasPage";
import { useAuth } from "./context/AuthProvider";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <TimeCanvasPage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
