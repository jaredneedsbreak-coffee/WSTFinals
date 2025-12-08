"use client"

import { useEffect, useState } from "react"
import AdminSidePanel from "../components/AdmineSidePanel"
import api from "../api"

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/user")
      setCurrentUser(res.data)
    } catch (err) {
      console.error("Error fetching current user", err)
    }
  }

  const fetchUsers = async () => {
    try {
      setError("")
      setLoading(true)
      const res = await api.get("/admin/users")
      setUsers(res.data.users || [])
    } catch (err) {
      console.error("Error fetching users:", err.response || err)
      setError(err.response?.data?.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border border-red-200"
      case "reviewer":
        return "bg-blue-100 text-blue-700 border border-blue-200"
      case "researcher":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <AdminSidePanel activeTab={"users"} />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Users Management
          </h1>
          <p className="text-slate-400">Manage and view all platform users</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div />
              <div className="text-sm text-slate-300">
                Signed in as: <span className="text-indigo-400 font-semibold">{currentUser?.name || "—"}</span>
                <span className="text-slate-500 mx-2">•</span>
                <span className="text-slate-300">{currentUser?.role || "—"}</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 text-red-300 rounded-lg border border-red-800/50">⚠️ {error}</div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-700/50 border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map((u, index) => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition-colors duration-200 group">
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono text-indigo-400">#{u.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-200 font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Total Users: <span className="text-indigo-400 font-semibold">{users.length}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Users
