"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CheckIcon,
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import api, { clearToken } from "../api"

function AdminSidePanel({ activeTab, setActiveTab }) {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const menuItems = [
    { label: "Overview", key: "overview", path: "/admin", icon: HomeIcon },
    { label: "Users", key: "users", path: "/admin/users", icon: UsersIcon },
    { label: "Proposals", key: "proposals", path: "/admin/proposals", icon: DocumentTextIcon },
  ]

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col p-6 justify-between overflow-y-auto border-r border-slate-700">
      <div className="space-y-8">
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer pb-6 border-b border-slate-700"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div>
            <span className="text-lg font-bold text-white">Research</span>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </div>

        {/* Menu Section */}
        <nav className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-4">Main Menu</div>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (setActiveTab) setActiveTab(item.key)
                  if (item.path) navigate(item.path)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 border-t border-slate-700 pt-6">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-red-600/10 transition-all duration-200 text-slate-300 hover:text-red-400 font-medium group"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
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
            <h2 className="text-2xl font-bold mb-3">Confirm Logout</h2>
            <p className="text-slate-300 mb-8">Are you sure you want to logout from your admin account?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300 font-medium"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-white font-semibold"
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

export default AdminSidePanel
