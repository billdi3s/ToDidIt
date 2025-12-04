import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import { TimeCanvasPage } from "./components/TimeCanvasPage";
import Login from "./Login";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="text-white p-6">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  return children;
}

function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <button
      onClick={signOut}
      className="absolute top-3 right-3 px-3 py-1 text-xs bg-red-600 rounded"
    >
      Log out
    </button>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Area */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="relative">
                <LogoutButton />
                <TimeCanvasPage />
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
