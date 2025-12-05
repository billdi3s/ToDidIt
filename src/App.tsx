import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import Login from "./Login";
import TimeCanvasPage from "./components/TimeCanvasPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      {user && (
        <button
          onClick={logout}
          className="fixed top-4 right-4 bg-red-600 px-4 py-2 rounded text-white"
        >
          Log Out
        </button>
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
      </Routes>
    </BrowserRouter>
  );
}
