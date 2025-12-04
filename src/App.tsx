import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import TimeCanvas from "./TimeCanvas";
import Login from "./Login";
import { useAuth } from "./context/AuthProvider";
import { supabase } from "./lib/supabaseClient";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { session } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Router>
      <nav
        className="w-full p-4 flex justify-between items-center"
        style={{ background: "#111", color: "white" }}
      >
        <Link to="/" className="text-xl font-semibold">
          2Done+1 Time Canvas
        </Link>

        {session && (
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Log out
          </button>
        )}
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <TimeCanvas />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
