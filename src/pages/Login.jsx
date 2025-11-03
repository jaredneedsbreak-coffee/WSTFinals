import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, UserIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", formData);
      setMessage(res.data.message || "Login successful 🎉");
      setLoading(false);

      // Optional: save user info or token to localStorage
      // localStorage.setItem("user", JSON.stringify(res.data.user));
      // localStorage.setItem("token", res.data.token);

      // redirect to dashboard after login
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Network error 😭");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D3DAD9] overflow-hidden relative">
      {/* Animated Background Circles */}
      <div className="absolute w-[500px] h-[500px] bg-[#715A5A] rounded-full blur-3xl opacity-20 animate-pulse -top-32 -left-32"></div>
      <div className="absolute w-[400px] h-[400px] bg-[#37353E] rounded-full blur-3xl opacity-20 animate-pulse top-20 -right-20"></div>

      {/* Card */}
      <div className="relative z-10 bg-[#37353E] text-[#D3DAD9] rounded-2xl shadow-2xl p-10 w-[400px] flex flex-col items-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-8 text-[#D3DAD9] tracking-wide">Welcome Back 👋</h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {/* Username */}
          <div className="flex items-center gap-3 bg-[#44444E] p-3 rounded-lg focus-within:ring-2 focus-within:ring-[#715A5A] transition-all duration-300">
            <UserIcon className="h-6 w-6 text-[#D3DAD9]" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-[#D3DAD9] placeholder-[#BFBFBF]"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 bg-[#44444E] p-3 rounded-lg focus-within:ring-2 focus-within:ring-[#715A5A] transition-all duration-300">
            <LockClosedIcon className="h-6 w-6 text-[#D3DAD9]" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-[#D3DAD9] placeholder-[#BFBFBF]"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 bg-[#715A5A] hover:bg-[#8A6D6D] text-[#D3DAD9] py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging In..." : "Login"} <ArrowRightIcon className="h-5 w-5" />
          </button>

          {/* Go Back Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 text-[#D3DAD9] hover:text-[#715A5A] transition-all duration-300 mt-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Go Back
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-red-400 font-semibold">{message}</p>
        )}

        {/* Footer */}
        <p className="text-sm text-[#BFBFBF] mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#715A5A] hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>

      {/* Fade-In Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Login;
