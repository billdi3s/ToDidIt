import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");

  async function sendMagicLink() {
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
        redirectTo: "https://2didit.com",
      },
    });

    if (error) alert(error.message);
  }

  return (
    <div className="p-10 text-white flex flex-col gap-4">
      <h1 className="text-2xl">Login</h1>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="p-3 text-black rounded"
      />

      <button onClick={sendMagicLink} className="bg-blue-600 p-3 rounded">
        Send Magic Link
      </button>

      <button onClick={signInWithGoogle} className="bg-red-600 p-3 rounded">
        Sign in with Google
      </button>
    </div>
  );
}
