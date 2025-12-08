"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline"
import api, { clearToken } from "../api"

function SidePanel() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { name: "Home", icon: HomeIcon, path: "/dashboard" },
    { name: "History", icon: ClockIcon, path: "/history" },
    { name: "Submission", icon: DocumentTextIcon, path: "/submission-status" },
  ]

  const [hovered, setHovered] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <>
      {/* Side Panel */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between p-6 shadow-2xl overflow-y-auto z-40 border-r border-slate-700/50">
        {/* Top Section */}
        <div className="space-y-8">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 px-2 py-3">
            <img
              src="https://minsu.edu.ph/template/images/logo.png"
              alt="Research Ethics Logo"
              className="w-10 h-10 rounded-lg shadow-lg"
            />
            <div>
              <span className="text-lg font-bold tracking-tight">Research</span>
              <span className="text-lg font-bold text-indigo-400">Ethics</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative
                    ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }
                    ${hovered === idx && !isActive ? "bg-slate-700/50" : ""}
                  `}
                >
                  <Icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-all duration-200 ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-l-lg"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="space-y-4 pt-6 border-t border-slate-700/50">
          <button
            onClick={() => setShowLogoutModal(true)}
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${
                hovered === "logout"
                  ? "bg-red-600/20 text-red-300 border border-red-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }
            `}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 transition-colors duration-200" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl w-96 animate-slideUp z-10 border border-slate-200">
            <h2 className="text-2xl font-bold mb-3 text-slate-900">Confirm Logout</h2>
            <p className="text-slate-600 mb-8 text-base">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await api.post("/logout")
                  } catch (err) {
                    console.error("Logout error:", err)
                  }
                  clearToken()
                  navigate("/login")
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm shadow-lg"
              >
                <CheckIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}

export default SidePanel
