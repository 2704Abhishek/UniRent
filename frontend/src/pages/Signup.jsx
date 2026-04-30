import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await api.post("/auth/signup", form);
      setMessage(data.message || "Signup successful.");
      navigate("/login");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <p className="label">Join UniRent</p>
        <h2 className="mt-2 text-3xl font-bold">Create account</h2>
        <p className="mb-6 mt-2 text-sm text-slate-600">Create your UniRent account to start listing and renting items.</p>
        <input
          className="field mb-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="field mb-3"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="field mb-4"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-primary w-full">Signup</button>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-campus" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
