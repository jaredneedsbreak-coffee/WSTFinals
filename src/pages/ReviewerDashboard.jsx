"use client"

import { useState, useEffect } from "react"
import {
  ClipboardDocumentCheckIcon,
  UsersIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import ReviewerSidePanel from "../components/ReviewerSidePanel"
import Announcements from "../components/Announcements"
import api from "../api"

function ReviewerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [papers, setPapers] = useState([])
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackStatus, setFeedbackStatus] = useState("revision_needed")
  const [submitting, setSubmitting] = useState(false)
  const [alertModal, setAlertModal] = useState({ show: false, message: "", type: "success" })
  const [loading, setLoading] = useState(false)

  const dashboardData = [
    {
      title: "Assigned Reviews",
      value: papers.filter((p) => p.status === "under_review" || p.status === "submitted").length,
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "Completed Reviews",
      value: papers.filter((p) => p.status === "approved" || p.status === "rejected" || p.status === "revision_needed").length,
      icon: ShieldCheckIcon,
    },
    {
      title: "Approved Papers",
      value: papers.filter((p) => p.status === "approved").length,
      icon: CheckCircleIcon,
    },
    { title: "Total Researchers", value: new Set(papers.map((p) => p.user_id)).size, icon: UsersIcon },
  ]

  useEffect(() => {
    if (activeTab === "users" || activeTab === "overview") {
      fetchPapers()
    }
  }, [activeTab])

  const fetchPapers = async () => {
    setLoading(true)
    try {
      const res = await api.get("/reviewer/papers")
      setPapers(res.data.papers)
    } catch (err) {
      console.error("Error fetching papers:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !selectedPaper) return

    setSubmitting(true)
    try {
      await api.post(`/papers/${selectedPaper.id}/feedback`, {
        feedback,
        status: feedbackStatus,
      })
      setShowFeedbackModal(false)
      setFeedback("")
      setFeedbackStatus("revision_needed")
      fetchPapers()
      setAlertModal({ show: true, message: "✅ Feedback submitted successfully!", type: "success" })
    } catch (err) {
      setAlertModal({ show: true, message: err.response?.data?.message || "Error submitting feedback", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500"
      case "under_review":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "revision_needed":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const statusDistribution = [
    {
      name: "Approved",
      value: papers.filter((p) => p.status === "approved").length,
      color: "#10b981",
    },
    {
      name: "Under Review",
      value: papers.filter((p) => p.status === "under_review").length,
      color: "#f59e0b",
    },
    {
      name: "Revision Needed",
      value: papers.filter((p) => p.status === "revision_needed").length,
      color: "#f97316",
    },
    {
      name: "Rejected",
      value: papers.filter((p) => p.status === "rejected").length,
      color: "#ef4444",
    },
    {
      name: "Submitted",
      value: papers.filter((p) => p.status === "submitted").length,
      color: "#3b82f6",
    },
  ].filter((item) => item.value > 0)

  const submissionTrends = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, index) => ({
      month,
      submitted: papers.filter((p) => {
        const date = new Date(p.created_at)
        return date.getMonth() === index
      }).length,
      approved: papers.filter((p) => {
        const date = new Date(p.created_at)
        return date.getMonth() === index && p.status === "approved"
      }).length,
    }))
  })()

  const approvedPapers = papers.filter((p) => p.status === "approved")

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <ReviewerSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 ml-64 p-8 ${showFeedbackModal ? "pointer-events-none opacity-50" : ""}`}>
        {activeTab === "overview" && (
          <>
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Reviewer Overview
              </h1>
              <p className="text-slate-400">Monitor your assigned reviews and submission progress</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-10">
              {dashboardData.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 hover:border-indigo-500 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg group-hover:from-indigo-500/30 group-hover:to-blue-500/30 transition-all">
                        <item.icon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{item.value}</div>
                    </div>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-1 bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Status Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} papers`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-white font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Submission Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={submissionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Bar dataKey="submitted" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="approved" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    Approved Papers
                  </h2>
                  {approvedPapers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-300">Author</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {approvedPapers.slice(0, 5).map((paper) => (
                            <tr
                              key={paper.id}
                              className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                            >
                              <td className="py-3 px-4 text-slate-200">{paper.title}</td>
                              <td className="py-3 px-4 text-indigo-400">{paper.user?.name}</td>
                              <td className="py-3 px-4 text-slate-400">
                                {new Date(paper.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-6">No approved papers yet</p>
                  )}
                </div>
              </div>

              <div className="col-span-1 bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                <Announcements theme="dark" />
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Assigned Papers for Review
              </h1>
              <p className="text-slate-400">Review and provide feedback on assigned proposals</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4" />
                  <p className="text-slate-400">Loading papers...</p>
                </div>
              </div>
            ) : papers.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <ClipboardDocumentCheckIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No papers assigned for review yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="group bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 hover:border-indigo-500 text-slate-100 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-400">
                          By: <span className="text-indigo-400">{paper.user?.name}</span> ({paper.user?.email})
                        </p>
                        <p className="mt-3 text-sm text-slate-300 line-clamp-2">
                          {(paper.abstract || "").substring(0, 150)}
                          {paper.abstract ? "..." : ""}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-white font-semibold whitespace-nowrap text-sm ${getStatusColor(paper.status)}`}
                      >
                        {paper.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {paper.feedback && (
                      <div className="mb-4 p-4 bg-slate-900/50 border-l-4 border-indigo-500 rounded-lg">
                        <label className="text-sm font-semibold text-slate-300">Your Feedback:</label>
                        <p className="text-slate-300 mt-2">{paper.feedback}</p>
                      </div>
                    )}

                    {paper.status === "under_review" && (
                      <button
                        onClick={() => {
                          setSelectedPaper(paper)
                          setShowFeedbackModal(true)
                        }}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50"
                      >
                        Submit Feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showFeedbackModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-slate-100 p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-600">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                      Submit Feedback
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Paper: <span className="text-indigo-300">{selectedPaper?.title}</span>
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-200">Your Feedback:</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-slate-900/50 text-slate-100 placeholder-slate-500 p-4 rounded-lg mt-2 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                      rows="6"
                      placeholder="Provide detailed feedback for the researcher..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-200">Decision:</label>
                    <select
                      value={feedbackStatus}
                      onChange={(e) => setFeedbackStatus(e.target.value)}
                      className="w-full bg-slate-900/50 text-slate-100 p-3 rounded-lg mt-2 outline-none border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    >
                      <option value="approved">Approved</option>
                      <option value="revision_needed">Revision Needed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitting || !feedback.trim()}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedbackModal(false)
                        setFeedback("")
                        setFeedbackStatus("revision_needed")
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "proposals" && (
          <>
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Review Statistics
              </h1>
              <p className="text-slate-400">Your review performance overview</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Papers Assigned</p>
                    <p className="text-4xl font-bold text-white mt-2">{papers.length}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg">
                    <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Under Review</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {papers.filter((p) => p.status === "under_review").length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <InformationCircleIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Completed Reviews</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {papers.filter((p) => p.status !== "under_review").length}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                    <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Alert Modal */}
      {alertModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setAlertModal({ ...alertModal, show: false })}
          ></div>
          <div className="relative bg-slate-900 text-white p-8 rounded-2xl shadow-2xl w-96 animate-slideUp z-50 border border-slate-700">
            <h2 className={`text-xl font-bold mb-4 ${alertModal.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {alertModal.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-slate-300 mb-6">{alertModal.message}</p>
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

export default ReviewerDashboard
