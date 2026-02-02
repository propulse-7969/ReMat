import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const Login = () => {
  const { login, loginWithGoogle, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect based on role
  if (!loading && user && profile) {
    return (
      <Navigate
        to={profile.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      // redirect happens automatically via AuthProvider + Navigate above
      
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        setError(error.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        setError(error.message || "Google login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <hr />

      <button onClick={handleGoogleLogin}>Login with Google</button>

      <p style={{ marginTop: 16 }}>
        Don’t have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/auth/signup")}
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default Login;
