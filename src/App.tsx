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
      {/* HEADER NAV — always visible */}
      <header className="w-full bg-gray-900 text-white border-b border-gray-700 p-4 flex justify-between items-center">
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
      </header>

      {/* MAIN ROUTES BELOW THE NAV */}
      <main className="pt-4">
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

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}
