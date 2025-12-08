"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserIcon, LockClosedIcon, EnvelopeIcon, UserPlusIcon, ArrowLeftIcon } from "@heroicons/react/24/solid"
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline"
import api from "../api"

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [detectedRole, setDetectedRole] = useState("user")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleEmailChange = (e) => {
    const { value } = e.target
    setFormData({ ...formData, email: value })
    // Additional logic to detect role can be added here
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setLoading(false)
      setMessageType("error")
      setMessage("Passwords do not match!")
      return
    }

    try {
      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      })

      setMessage("Signup successful! Redirecting to login...")
      setMessageType("success")
      setLoading(false)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setLoading(false)
      setMessageType("error")
      if (err.response?.data?.errors) {
        setMessage(Object.values(err.response.data.errors).flat().join(" "))
      } else if (err.response?.data?.message) {
        setMessage(err.response.data.message)
      } else {
        setMessage("Network error. Please try again.")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden relative py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl px-8 py-12 text-white text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <img
              src="https://minsu.edu.ph/template/images/logo.png"
              alt="Logo"
              className="w-16 h-16 bg-white rounded-full p-2"
            />
          </div>
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <UserPlusIcon className="w-8 h-8" />
            Create Account
          </h2>
          <p className="text-indigo-100 text-sm">Join our research ethics community</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border-2 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <UserIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border-2 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <EnvelopeIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
              {detectedRole !== "user" && (
                <p className="text-xs text-indigo-600 mt-2 font-medium">
                  Role detected: <span className="capitalize font-bold">{detectedRole}</span>
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border-2 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <LockClosedIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border-2 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <LockClosedIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>

            {message && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg text-sm ${messageType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {messageType === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded-lg transition-all font-medium text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </button>

            <p className="text-center text-sm text-slate-600 mt-2">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer transition-colors"
              >
                Log in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
