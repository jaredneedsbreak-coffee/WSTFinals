"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api, { clearToken } from "../api"
import SidePanel from "../components/SidePanel"
import Announcements from "../components/Announcements"
import Notifications from "../components/Notifications"
import {
  UserIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentIcon,
  SparklesIcon,
  TrophyIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

function UserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    paperFile: null,
  })
  const [message, setMessage] = useState("")
  const [alertModal, setAlertModal] = useState({ show: false, message: "", type: "success" })

  const handleSubmitPaper = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("paper", formData.paperFile)
      
      const response = await api.post("/papers/submit", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setAlertModal({ show: true, message: "Paper submitted successfully!", type: "success" })
      setFormData({ title: "", paperFile: null })
    } catch (error) {
      setAlertModal({ show: true, message: error.response?.data?.message || "Failed to submit paper.", type: "error" })
    } finally {
      setSubmitting(false)
      setTimeout(() => {
        setShowSubmitForm(false)
      }, 2000)
    }
  }

  const handleInputChange = (event) => {
    const { name, value, files } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "paperFile" ? files[0] : value,
    }))
  }

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userResponse = await api.get("/user")
        setUser(userResponse.data)
        const postsResponse = await api.get("/papers/my-papers")
        setPosts(postsResponse.data.papers || postsResponse.data || [])
      } catch (error) {
        console.error("Error fetching user data:", error)
        clearToken()
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndPosts()
  }, [navigate])

  const calculateStats = () => {
    const total = posts.length
    const approved = posts.filter((p) => p.status === "approved").length
    const submitted = posts.filter((p) => p.status === "submitted").length
    const under_review = posts.filter((p) => p.status === "under_review").length
    const revision_needed = posts.filter((p) => p.status === "revision_needed").length
    const rejected = posts.filter((p) => p.status === "rejected").length
    const acceptanceRate = total > 0 ? Math.round((approved / total) * 100) : 0

    return { total, approved, submitted, under_review, revision_needed, rejected, acceptanceRate }
  }

  const stats = calculateStats()

  const pieChartData = [
    { name: "Approved", value: stats.approved, color: "#10b981" },
    { name: "Under Review", value: stats.under_review, color: "#f59e0b" },
    { name: "Revision Needed", value: stats.revision_needed, color: "#f97316" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = months.map((month, index) => ({
      month,
      submissions: posts.filter((p) => {
        const date = new Date(p.created_at || p.createdAt)
        return date.getMonth() === index
      }).length,
    }))
    return data.filter((item) => item.submissions > 0).slice(-6) // Show last 6 months
  }

  const approvedPapers = posts.filter((p) => p.status === "approved")

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )

  return (
    <div className="flex h-screen bg-slate-50">
      <SidePanel />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <UserIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || "Researcher"}</h1>
                <p className="text-sm text-slate-500 mt-1">Manage and track your research proposals</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Notifications />
              <button
                onClick={() => setShowSubmitForm(!showSubmitForm)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5" />
                Submit Paper
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-8 h-full">
            {/* Main Content - Left Side */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Papers Card */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-green-100">Total Papers</h3>
                    <DocumentIcon className="h-5 w-5 text-green-200" />
                  </div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-green-100 mt-2">Submissions submitted</p>
                </div>

                {/* Approved Papers Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-emerald-100">Approved</h3>
                    <DocumentCheckIcon className="h-5 w-5 text-emerald-200" />
                  </div>
                  <p className="text-3xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-emerald-100 mt-2">Successfully approved</p>
                </div>

                {/* Pending Reviews Card */}
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-amber-100">Pending</h3>
                    <ClockIcon className="h-5 w-5 text-amber-200" />
                  </div>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-amber-100 mt-2">Under review</p>
                </div>

                {/* Acceptance Rate Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-blue-100">Acceptance Rate</h3>
                    <ChartBarIcon className="h-5 w-5 text-blue-200" />
                  </div>
                  <p className="text-3xl font-bold">{stats.acceptanceRate}%</p>
                  <p className="text-xs text-blue-100 mt-2">Approval success rate</p>
                </div>
              </div>

              {/* Submission Trends */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900">Submission Trends</h2>
                </div>

                {getMonthlyData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Bar dataKey="submissions" fill="#16a34a" radius={[8, 8, 0, 0]} name="Submissions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-slate-400">
                    <p>No submission data available yet.</p>
                  </div>
                )}
              </div>

              {/* Submission Status Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-purple-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900">Submission Status Overview</h2>
                </div>

                {stats.total > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Chart */}
                    <div className="flex-1 flex justify-center">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name} ${value}`}
                            outerRadius={120}
                            innerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} paper(s)`}
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "8px",
                              color: "#f1f5f9",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend with details */}
                    <div className="flex-1 space-y-4">
                      {pieChartData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-md"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-600">
                              {item.value} paper{item.value !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-slate-900">
                            {Math.round((item.value / stats.total) * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-slate-400">
                    <p>No submissions yet. Submit your first paper to see statistics.</p>
                  </div>
                )}
              </div>

              {/* Approved Papers */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-900">Approved Papers</h2>
                  <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {approvedPapers.length}
                  </span>
                </div>

                {approvedPapers.length > 0 ? (
                  <div className="space-y-4">
                    {approvedPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="flex items-start justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                            <TrophyIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{paper.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-xs text-slate-600">
                                <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
                                {new Date(paper.created_at || paper.createdAt).toLocaleDateString()}
                              </p>
                              <span className="px-2.5 py-1 bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                                Approved
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <TrophyIcon className="h-12 w-12 text-slate-300 mb-2" />
                    <p>No approved papers yet. Keep submitting!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="w-96 border-l border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-6 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-green-500 to-purple-500 rounded-lg shadow-md">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Announcements</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Latest updates</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <Announcements theme="light" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Paper Form */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubmitForm(false)}></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slideUp z-10 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-7 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Submit Research Paper</h2>
                <p className="text-green-100 text-sm mt-1">Upload your proposal for ethics review</p>
              </div>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPaper} className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Paper Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter your research paper title..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Upload Paper</label>
                <div className="relative">
                  <input
                    type="file"
                    name="paperFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all file:mr-4 file:bg-green-100 file:text-green-700 file:px-3 file:py-1 file:rounded file:border-0 file:font-semibold cursor-pointer"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Supported formats: PDF, DOC, DOCX • Max file size: 25MB</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                    submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700 shadow-sm hover:shadow-md"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Paper"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    message.includes("✅")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.includes("✅") && <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />}
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setAlertModal({ ...alertModal, show: false })}
          ></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-96 animate-slideUp z-50 border border-slate-200">
            <h2 className={`text-xl font-bold mb-4 ${alertModal.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {alertModal.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-slate-700 mb-6">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal({ ...alertModal, show: false })}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                alertModal.type === "success"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
