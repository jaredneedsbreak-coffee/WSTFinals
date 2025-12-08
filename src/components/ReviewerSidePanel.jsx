"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRightOnRectangleIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline"
import api, { clearToken } from "../api"

function ReviewerSidePanel({ activeTab, setActiveTab }) {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const menuItems = [
    { label: "Overview", key: "overview", path: "/reviewer" },
    { label: "Proposals", key: "proposals", path: "/proposal-review" },
  ]

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col p-6 justify-between overflow-y-auto border-r border-slate-700">
      <div className="space-y-8">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <img src="https://minsu.edu.ph/template/images/logo.png" alt="Minsu Logo" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tight">
            Reviewer<span className="text-indigo-400">Panel</span>
          </span>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (setActiveTab) setActiveTab(item.key)
                if (item.path) navigate(item.path)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Logout */}
      <div className="mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-600/20 to-blue-600/20 hover:from-indigo-600/40 hover:to-blue-600/40 border border-indigo-500/30 transition-all duration-300 w-full text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/10"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 text-indigo-400" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal - Popup aligned to logout button */}
      {showLogoutModal && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end">
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          {/* Modal Popup */}
          <div className="relative bg-slate-900 text-white p-6 rounded-2xl shadow-2xl w-72 animate-slideUp z-50 border border-slate-600">
            <h2 className="text-xl font-bold mb-3">Confirm Logout</h2>
            <p className="text-slate-300 mb-8">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300"
              >
                <XMarkIcon className="h-5 w-5" />
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all text-white font-semibold"
              >
                <CheckIcon className="h-5 w-5" />
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
    </aside>
  )
}

export default ReviewerSidePanel
