import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const nextPath = location.state?.from || "/home";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate(nextPath, { replace: true });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="label">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to create listings, request rentals, and manage payments.</p>
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn-primary w-full">
          Login
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      <p className="mt-4 text-sm text-slate-600">
        New here? <Link className="font-semibold text-campus" to="/signup">Create an account</Link>
      </p>
      </div>
    </div>
  );
}
