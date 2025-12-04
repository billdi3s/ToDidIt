import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");

  //
  // MAGIC LINK LOGIN
  //
  async function signInMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      shouldCreateUser: true
    });

    if (error) alert(error.message);
    else alert("Magic link sent!");
  }

  //
  // GOOGLE OAUTH LOGIN
  //
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

      {/* Email input */}
      <input
        className="p-2 rounded text-black mb-4 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />

      {/* Magic Link Button */}
      <div className="mb-4">
        <button
          className="p-2 bg-blue-500 rounded mr-2"
          onClick={signInMagicLink}
        >
          Send Magic Link
        </button>
      </div>

      {/* Google Button */}
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
