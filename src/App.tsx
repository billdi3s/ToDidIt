import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "./context/AuthProvider";
import { TimeCanvasPage } from "./components/TimeCanvasPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-white">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const App = () => {
  const { user, signOut } = useAuth();

  return (
    <BrowserRouter>
      {user && (
        <div className="absolute top-4 right-4">
          <button
            onClick={signOut}
            className="px-3 py-1 bg-slate-700 text-white rounded"
          >
            Log out
          </button>
        </div>
      )}

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

        {/* SPA fallback — prevents /# issue on OAuth */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
