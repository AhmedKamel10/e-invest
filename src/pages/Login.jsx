import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/auth/login", form);
    localStorage.setItem("token", res.data.token); // ✅ store only the JWT string
    navigate("/dashboard");
  } catch (err) {
    alert("Login failed");
  }
};


  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-300"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
