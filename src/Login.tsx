import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");

  async function signinWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin // NO trailing slash, prevents /#
      }
    });

    if (error) alert(error.message);
  }

  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      shouldCreateUser: true,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) alert(error.message);
    else alert("Magic link sent!");
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
      <button className="ml-2 p-2 bg-blue-500 rounded" onClick={sendMagicLink}>
        Send Magic Link
      </button>

      <div className="mt-4">
        <button
          className="p-2 bg-red-500 rounded"
          onClick={signinWithGoogle}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
