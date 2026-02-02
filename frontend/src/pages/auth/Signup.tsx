import { FormEvent, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const Signup = () => {
  const { signup, loginWithGoogle, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already logged in → redirect
  if (!loading && user && profile) {
    return (
      <Navigate
        to={profile.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(email, password);
      // profile + role fetched automatically via AuthProvider
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        setError(error.message || "Signup failed");
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        setError(error.message || "Google signup failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Create Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSignup}>
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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      <hr />

      <button onClick={handleGoogleSignup}>Sign up with Google</button>

      <p style={{ marginTop: 16 }}>
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/auth/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
