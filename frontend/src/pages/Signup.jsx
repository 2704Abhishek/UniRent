import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/auth/signup", form);
    alert("OTP sent to your email!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <input className="border p-2 w-full mb-2" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 w-full mb-2" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="border p-2 w-full mb-2" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-500 text-white p-2 w-full">Signup</button>
      </form>
    </div>
  );
}
