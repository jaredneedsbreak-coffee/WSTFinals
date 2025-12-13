"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LockClosedIcon, UserIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import api, { setToken } from "../api"

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const loginRes = await api.post("/login", formData)

      if (loginRes.data.token) {
        setToken(loginRes.data.token)

        // Fetch user data to get the role
        let userObj = null
        let userRole = loginRes.data.role || "user"
        
        try {
          const me = await api.get("/user")
          userObj = me.data
          userRole = userObj?.role || loginRes.data.role || "user"
          sessionStorage.setItem("userRole", userRole)
          sessionStorage.setItem("user", JSON.stringify(userObj))
        } catch (err) {
          console.error("Failed to fetch user:", err)
          // Continue with login even if user fetch fails
          sessionStorage.setItem("userRole", userRole)
        }

        setMessage("Login successful! Redirecting...")
        setLoading(false)

        // Redirect after message is shown
        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/admin")
          } else if (userRole === "reviewer") {
            navigate("/reviewer")
          } else {
            navigate("/dashboard")
          }
        }, 500)
      }
    } catch (err) {
      setLoading(false)
      if (err.response?.data?.message) setMessage(err.response.data.message)
      else setMessage("Network error 😭")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden relative">
      <div className="absolute w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse -top-40 -left-40"></div>
      <div className="absolute w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-10 animate-pulse top-32 -right-32"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-12 text-center">
            <img
              src="https://minsu.edu.ph/template/images/logo.png"
              alt="ResearchEthics Logo"
              className="w-20 h-20 mx-auto mb-4 rounded-lg bg-white p-2 shadow-lg"
            />
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-green-100 text-sm">Access your research ethics portal</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-md transition-all">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your.email@institution.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 focus-within:border-green-500 focus-within:bg-white focus-within:shadow-md transition-all">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Error/Success Message */}
              {message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                    message.includes("successful")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.includes("successful") && <CheckCircleIcon className="h-4 w-4" />}
                  {message}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Navigation Links */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:text-green-600 font-medium py-2 rounded-lg hover:bg-slate-50 transition-all text-sm"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="flex-1 text-center text-slate-600 hover:text-green-600 font-medium py-2 rounded-lg hover:bg-slate-50 transition-all text-sm"
                >
                  Sign Up
                </button>
              </div>
            </form>

            {/* Footer Text */}
            <p className="text-center text-xs text-slate-500 mt-6 pt-6 border-t border-slate-100">
              Secure login powered by ResearchEthics
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>🔒 Your data is encrypted and secure</p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade {
          animation: fade 1s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Login
