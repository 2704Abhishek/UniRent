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
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="field pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                {showPassword ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.5 5.2A9.3 9.3 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13.5 13.5 0 0 1-2.1 3.1" />
                    <path d="M6.6 6.6A13.4 13.4 0 0 0 2.5 12C3.5 14.5 7 19 12 19a9.4 9.4 0 0 0 4-.9" />
                  </>
                ) : (
                  <>
                    <path d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </>
                )}
              </svg>
            </button>
          </div>
          <button className="btn-primary w-full">
            Sign in
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
