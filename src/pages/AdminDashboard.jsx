"use client"

import React, { useState, useEffect } from "react"
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  PlusIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import AdminSidePanel from "../components/AdmineSidePanel"
import Announcements from "../components/Announcements"
import api from "../api"

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [proposals, setProposals] = useState([])
  const [reviewers, setReviewers] = useState([])
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [reviewersPage, setReviewersPage] = useState(1)
  const [revisionPage, setRevisionPage] = useState(1)
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    proposalsReviewed: 0,
    pendingReviews: 0,
    systemAlerts: 0,
  })
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const announcementsRef = React.useRef()

  const chartColors = {
    submitted: "#6366f1",
    approved: "#10b981",
    rejected: "#ef4444",
    revision: "#f59e0b",
    under_review: "#3b82f6",
  }

  // Pagination settings
  const itemsPerPage = 4
  const reviewersPerPage = 4

  const dashboardData = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      icon: UsersIcon,
      gradient: "from-blue-600 via-blue-500 to-cyan-500",
      trend: "+12%",
    },
    {
      title: "Proposals Reviewed",
      value: dashboardStats.proposalsReviewed,
      icon: ClipboardDocumentCheckIcon,
      gradient: "from-emerald-600 via-teal-500 to-cyan-500",
      trend: "+8%",
    },
    {
      title: "Pending Reviews",
      value: dashboardStats.pendingReviews,
      icon: ShieldCheckIcon,
      gradient: "from-amber-600 via-orange-500 to-red-500",
      trend: "-3%",
    },
    {
      title: "System Alerts",
      value: dashboardStats.systemAlerts,
      icon: InformationCircleIcon,
      gradient: "from-violet-600 via-purple-500 to-pink-500",
      trend: "0%",
    },
  ]

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, papersRes, analyticsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/papers"),
        api.get("/admin/analytics"),
      ])

      const allUsers = usersRes.data.users || []
      const allPapers = papersRes.data.papers || []
      const analyticsData = analyticsRes.data.analytics || []

      const reviewedPapers = allPapers.filter((p) => p.status === "approved" || p.status === "rejected").length
      const pendingReviews = allPapers.filter((p) => p.status === "under_review" || p.status === "submitted").length

      setDashboardStats({
        totalUsers: allUsers.length,
        proposalsReviewed: reviewedPapers,
        pendingReviews: pendingReviews,
        systemAlerts: 0,
      })
      setAnalytics(analyticsData)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
    }
  }

  const fetchProposals = async () => {
    try {
      const res = await api.get("/admin/papers")
      console.log("Proposals response:", res.data)
      setProposals(res.data.papers || res.data || [])
    } catch (err) {
      console.error("Error fetching proposals:", err)
      setProposals([])
    }
  }

  const fetchReviewers = async () => {
    try {
      const res = await api.get("/admin/reviewers")
      console.log("Reviewers response:", res.data)
      setReviewers(res.data.reviewers || res.data || [])
    } catch (err) {
      console.error("Error fetching reviewers:", err)
      setReviewers([])
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users")
      setUsers(res.data.users || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const handleAssignReviewer = async () => {
    if (!selectedReviewer || !selectedPaper) return

    setLoading(true)
    try {
      await api.post(`/admin/papers/${selectedPaper.id}/assign-reviewer`, {
        reviewer_id: selectedReviewer,
        admin_notes: adminNotes,
      })
      setShowAssignModal(false)
      setSelectedReviewer("")
      setAdminNotes("")
      fetchProposals()
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning reviewer")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (paperId, newStatus) => {
    try {
      await api.patch(`/admin/papers/${paperId}/status`, {
        status: newStatus,
      })
      fetchProposals()
    } catch (err) {
      alert("Error updating status")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 border border-blue-300"
      case "under_review":
        return "bg-amber-100 text-amber-800 border border-amber-300"
      case "approved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300"
      case "rejected":
        return "bg-rose-100 text-rose-800 border border-rose-300"
      case "revision_needed":
        return "bg-orange-100 text-orange-800 border border-orange-300"
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300"
    }
  }

  // Calculate reviewer statistics
  const calculateReviewerStats = (reviewer) => {
    const reviewedPapers = proposals.filter((p) => p.reviewer_id === reviewer.id)
    const completedReviews = reviewedPapers.filter(
      (p) => p.status === "approved" || p.status === "rejected" || p.status === "revision"
    ).length
    const accuracy = completedReviews > 0 ? Math.round((completedReviews / reviewedPapers.length) * 100) : 0
    return { reviews: reviewedPapers.length, accuracy: accuracy }
  }

  // Get papers with revision status
  const revisionPapers = proposals.filter((p) => 
    p.status === "revision" || p.status === "revision_needed"
  )
  console.log("Total proposals:", proposals.length)
  console.log("Papers needing revision:", revisionPapers)

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardStats()
      fetchProposals()
      fetchReviewers()
    } else if (activeTab === "proposals") {
      fetchProposals()
      fetchReviewers()
    } else if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab])

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 p-8">
        {activeTab === "overview" && (
          <>
            <header className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-600 text-lg">Monitor proposals, reviewers, and platform analytics</p>
              </div>
              <button
                onClick={() => announcementsRef.current?.openModal?.()}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-violet-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
              >
                <PlusIcon className="h-6 w-6" />
                Post Announcement
              </button>
            </header>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {dashboardData.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${item.gradient} p-8 rounded-2xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/10 backdrop-blur-sm`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                      {item.trend.startsWith("+") ? (
                        <ArrowUpRightIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeftIcon className="w-4 h-4" />
                      )}
                      {item.trend}
                    </div>
                  </div>
                  <h3 className="text-5xl font-black mb-2">{item.value}</h3>
                  <p className="text-white/80 font-semibold text-lg">{item.title}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Submission Trends */}
              <div className="md:col-span-2 bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Trends</h2>
                <p className="text-slate-600 text-sm mb-6">Monthly submissions over time</p>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={analytics}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                      }}
                      cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="submitted"
                      stroke="#818cf8"
                      fillOpacity={1}
                      fill="url(#colorSubmitted)"
                      name="Submitted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Proposals Status Distribution */}
              <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Status Distribution</h2>
                <p className="text-slate-600 text-sm mb-6">Overall proposal breakdown</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: dashboardStats.proposalsReviewed * 0.6 },
                        { name: "Pending", value: dashboardStats.pendingReviews },
                        { name: "Revision", value: dashboardStats.proposalsReviewed * 0.2 },
                        { name: "Rejected", value: dashboardStats.proposalsReviewed * 0.2 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Review Results & Performance */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Review Results */}
              <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200\">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Results</h2>
                <p className="text-slate-600 text-sm mb-6">Monthly approval and rejection breakdown</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                      }}
                      cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                    />
                    <Legend />
                    <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Reviewer Performance */}
              <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Top Reviewers</h2>
                <p className="text-slate-600 text-sm mb-6">Most active reviewers in system</p>
                <div className="space-y-4">
                  {!reviewers || reviewers.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No reviewers registered yet</p>
                  ) : (
                    (() => {
                      const sortedReviewers = reviewers
                        .map((reviewer) => {
                          const stats = calculateReviewerStats(reviewer)
                          return { ...reviewer, ...stats }
                        })
                        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
                      const totalReviewerPages = Math.ceil(sortedReviewers.length / reviewersPerPage)
                      const startIdx = (reviewersPage - 1) * reviewersPerPage
                      const paginatedReviewers = sortedReviewers.slice(startIdx, startIdx + reviewersPerPage)

                      return (
                        <>
                          {paginatedReviewers.map((reviewer, idx) => (
                            <div
                              key={reviewer.id || idx}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-500/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 mb-1">{reviewer.name || "Unknown"}</p>
                                <p className="text-sm text-slate-600">{reviewer.reviews || 0} papers assigned</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-1">
                                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                      style={{ width: `${reviewer.accuracy || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-400">{reviewer.accuracy || 0}%</span>
                                </div>
                                <p className="text-xs text-slate-600">Completion Rate</p>
                              </div>
                            </div>
                          ))}
                          {totalReviewerPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600/30">
                              <button
                                onClick={() => setReviewersPage((p) => Math.max(1, p - 1))}
                                disabled={reviewersPage === 1}
                                className="px-3 py-1 text-sm bg-slate-200 text-slate-900 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                ← Previous
                              </button>
                              <span className="text-sm text-slate-600">
                                Page {reviewersPage} of {totalReviewerPages}
                              </span>
                              <button
                                onClick={() => setReviewersPage((p) => Math.min(totalReviewerPages, p + 1))}
                                disabled={reviewersPage === totalReviewerPages}
                                className="px-3 py-1 text-sm bg-slate-200 text-slate-900 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </>
                      )
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Additional Analytics - Revision & Under Review */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Revision Requests */}
              <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Revision Requests</h2>
                <p className="text-slate-600 text-sm mb-6">Papers sent back for revision by reviewers</p>
                <div className="space-y-3">
                  {!revisionPapers || revisionPapers.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No papers requiring revision</p>
                  ) : (
                    (() => {
                      const totalRevisionPages = Math.ceil(revisionPapers.length / itemsPerPage)
                      const startIdx = (revisionPage - 1) * itemsPerPage
                      const paginatedRevisions = revisionPapers.slice(startIdx, startIdx + itemsPerPage)

                      return (
                        <>
                          <div className="max-h-80 overflow-y-auto space-y-3">
                            {paginatedRevisions.map((paper) => (
                              <div
                                key={paper.id}
                                className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 mb-1 truncate\">{paper.title || 'Untitled'}</p>
                                  <p className="text-sm text-slate-400 truncate">
                                    Author: {paper.user?.name || paper.user_id || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-amber-400 mt-1 truncate">
                                    Reviewer: {paper.reviewer?.name || 'Unassigned'}
                                  </p>
                                  {paper.admin_notes && (
                                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">📝 {paper.admin_notes}</p>
                                  )}
                                </div>
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold flex-shrink-0 ml-3">
                                  Revision
                                </span>
                              </div>
                            ))}
                          </div>
                          {totalRevisionPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600/30">
                              <button
                                onClick={() => setRevisionPage((p) => Math.max(1, p - 1))}
                                disabled={revisionPage === 1}
                                className="px-3 py-1 text-sm bg-slate-200 text-slate-900 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                ← Previous
                              </button>
                              <span className="text-sm text-slate-600">
                                Page {revisionPage} of {totalRevisionPages}
                              </span>
                              <button
                                onClick={() => setRevisionPage((p) => Math.min(totalRevisionPages, p + 1))}
                                disabled={revisionPage === totalRevisionPages}
                                className="px-3 py-1 text-sm bg-slate-200 text-slate-900 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </>
                      )
                    })()
                  )}
                </div>
              </div>

              {/* Under Review Papers */}
              <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Under Review Progress</h2>
                <p className="text-slate-600 text-sm mb-6">Papers currently under review by month</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                      }}
                      cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                    />
                    <Bar dataKey="under_review" fill="#3b82f6" name="Under Review" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complete Workflow Overview */}
            <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Proposal Workflow</h2>
              <p className="text-slate-600 text-sm mb-6">All proposal statuses by month</p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                    cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                  />
                  <Legend />
                  <Bar dataKey="submitted" fill="#6366f1" name="Submitted" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="under_review" fill="#3b82f6" name="Under Review" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="revision" fill="#f59e0b" name="Revision" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>



            <div className="bg-white to-white p-8 rounded-2xl shadow-sm border border-slate-200\">
              <Announcements ref={announcementsRef} showCreateForm={true} theme="dark" />
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">Users Management</h1>
            <p className="text-slate-600 text-lg mb-8">Monitor and manage platform users</p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden\">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-green-900/50 to-violet-900/50 border-b border-slate-600/30">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-100">ID</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-100">Name</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-100">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-100">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-lg">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-slate-300 font-medium">{user.id}</td>
                        <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold ${
                              user.role === "admin"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : user.role === "reviewer"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "proposals" && (
          <>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Research Proposals</h1>
            <p className="text-slate-400 text-lg mb-8">Manage and assign proposals for review</p>

            <div className="space-y-6">
              {proposals.length === 0 ? (
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-12 rounded-2xl shadow-2xl border border-slate-600/30 text-center">
                  <ClipboardDocumentCheckIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-lg text-slate-400">No proposals submitted yet.</p>
                </div>
              ) : (
                proposals.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/30 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">{paper.title}</h3>
                        <p className="text-slate-400 mb-4">
                          Submitted by: <span className="font-semibold text-slate-200">{paper.user?.name}</span> (
                          {paper.user?.email})
                        </p>
                        <p className="text-slate-300 leading-relaxed">{paper.abstract}</p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ml-4 ${getStatusColor(paper.status)}`}
                      >
                        {paper.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/30">
                      <div>
                        <label className="text-sm font-bold text-slate-300 block mb-1">Assigned Reviewer</label>
                        <p className="text-slate-100 font-medium">
                          {paper.reviewer?.name || <span className="text-slate-500">Not assigned</span>}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-300 block mb-1">Submitted Date</label>
                        <p className="text-slate-100 font-medium">{new Date(paper.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {paper.admin_notes && (
                      <div className="mb-6 p-4 bg-amber-500/10 border-l-4 border-amber-500/50 rounded">
                        <label className="text-sm font-bold text-amber-300 block mb-2">Admin Notes</label>
                        <p className="text-amber-100">{paper.admin_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedPaper(paper)
                          setShowAssignModal(true)
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-violet-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-violet-700 transition-all shadow-lg"
                      >
                        {paper.reviewer ? "Change Reviewer" : "Assign Reviewer"}
                      </button>
                      <select
                        onChange={(e) => handleUpdateStatus(paper.id, e.target.value)}
                        className="bg-slate-700/50 border-2 border-slate-600 text-slate-100 px-4 py-3 rounded-xl font-medium hover:border-green-500 transition-all outline-none focus:border-green-500"
                      >
                        <option value="">Update Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="revision_needed">Revision Needed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showAssignModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-600/30">
                  <h2 className="text-2xl font-bold text-white mb-6">Assign Reviewer</h2>

                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-200 block mb-2">Select Reviewer</label>
                    <select
                      value={selectedReviewer}
                      onChange={(e) => setSelectedReviewer(e.target.value)}
                      className="w-full bg-slate-700/50 text-slate-100 p-3 rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="">Choose a reviewer...</option>
                      {reviewers.map((reviewer) => (
                        <option key={reviewer.id} value={reviewer.id}>
                          {reviewer.name} ({reviewer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-200 block mb-2">Admin Notes (Optional)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-slate-700/50 text-slate-100 p-3 rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors font-medium"
                      rows="4"
                      placeholder="Add any notes for the reviewer..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAssignReviewer}
                      disabled={loading || !selectedReviewer}
                      className="flex-1 bg-gradient-to-r from-green-600 to-violet-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? "Assigning..." : "Assign Reviewer"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAssignModal(false)
                        setSelectedReviewer("")
                        setAdminNotes("")
                      }}
                      className="flex-1 bg-slate-700/50 text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-600 transition-all border border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
