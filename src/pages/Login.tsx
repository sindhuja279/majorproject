import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!supabase) {
    return (
      <div style={{ maxWidth: 420, margin: "6rem auto", padding: 20 }}>
        <h2>Authentication Disabled</h2>
        <p style={{ marginTop: 12 }}>
          Supabase credentials are not configured. Provide <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> in a <code>.env</code> file to enable email login.
        </p>
        <button style={{ marginTop: 24 }} onClick={() => navigate("/")}>
          Continue to Dashboard
        </button>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
      } else {
        setMsg("Logged in!");
        // optionally redirect to dashboard
        navigate("/");
      }
    } catch (err: any) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) setMsg(error.message);
      else setMsg("Check your email for a sign-in link (magic link).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "6rem auto", padding: 20 }}>
      <h2>Sign in</h2>
      <form onSubmit={handleLogin}>
        <label style={{ display: "block", marginTop: 12 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button onClick={handleMagicLink} disabled={loading || !email} type="button">
            Send magic link
          </button>
        </div>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </form>
    </div>
  );
}
