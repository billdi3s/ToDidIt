import { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthProvider";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const { session } = useAuth();

  // If already logged in, redirect to main page
  if (session) return <Navigate to="/" replace />;

  async function signInWithMagic() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      shouldCreateUser: true,
    });
    if (error) alert(error.message);
    else alert("Magic link sent!");
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) alert(error.message);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-4">Login</h1>

      <input
        className="p-2 rounded text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />

      <button
        className="ml-2 p-2 bg-blue-500 rounded"
        onClick={signInWithMagic}
      >
        Send Magic Link
      </button>

      <div className="mt-4">
        <button
          className="p-2 bg-red-600 rounded"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
