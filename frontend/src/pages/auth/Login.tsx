import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import RoleRedirect from "../../app/RoleRedirect";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await login(email, password);
      navigate("/", { replace: true }); 
    } 
    catch (err: unknown) {
      const error = err as {code?: string, message?: string};

      if(error.message=="Firebase: Error (auth/invalid-credential).") {
        alert("Please sign up first")
        navigate("/auth/signup", {replace: true})
        return
      }

      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/", {replace: true});
    } 
    catch (err: unknown) {
      const error = err as {code?: string, message?: string};

      if(error.message==="USER_NOT_REGISTERED") {
        alert("Please register your account first!")
        navigate("/auth/signup", {replace: true})
        return;
      }

      setError(error.message || "Google login failed");
    } finally {
      setLoading(false);
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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <hr />

      <button onClick={handleGoogleLogin} disabled={loading}>
        Login with Google
      </button>

      <p style={{ marginTop: 16 }}>
        Don’t have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/auth/signup")}
        >
          Sign up
        </span>
      </p>
      <RoleRedirect />
    </div>
  );
};

export default Login;
