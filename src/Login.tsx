import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function signInMagicLink() {
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
        redirectTo: "https://2didit.com/login"
      }
    });

    if (error) alert(error.message);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-6 font-semibold">Login</h1>

      <input
        className="p-2 rounded text-black mb-4 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />

      <div className="mb-4">
        <button
          className="p-2 bg-blue-500 rounded mr-2"
          onClick={signInMagicLink}
        >
          Send Magic Link
        </button>
      </div>

      <div>
        <button
          className="p-2 bg-red-500 rounded"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
