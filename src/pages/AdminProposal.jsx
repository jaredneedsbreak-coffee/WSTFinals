"use client"

import { useState, useEffect } from "react"
import AdminSidePanel from "../components/AdmineSidePanel"
import api from "../api"

function AdminProposal() {
  const [currentUser, setCurrentUser] = useState(null)
  const [proposals, setProposals] = useState([])
  const [error, setError] = useState(null)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [reviewers, setReviewers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    // Fetch current user data
    api
      .get("/user")
      .then((response) => {
        setCurrentUser(response.data)
      })
      .catch((err) => {
        console.error("Error fetching user:", err)
        setError(err.message)
      })

    // Fetch proposals data
    api
      .get("/admin/papers")
      .then((response) => {
        setProposals(response.data.papers || response.data || [])
      })
      .catch((err) => {
        console.error("Error fetching papers:", err)
        setError(err.message)
      })

    // Fetch reviewers data
    api
      .get("/admin/reviewers")
      .then((response) => {
        setReviewers(response.data.reviewers || response.data || [])
      })
      .catch((err) => {
        console.error("Error fetching reviewers:", err)
        setError(err.message)
      })
  }, [])

  const handleAssignReviewer = () => {
    setLoading(true)
    api
      .post(`/admin/papers/${selectedPaper.id}/assign-reviewer`, {
        reviewer_id: selectedReviewer,
        admin_notes: adminNotes,
      })
      .then((response) => {
        // Update proposals state after successful assignment
        const updatedProposals = proposals.map((p) => {
          if (p.id === selectedPaper.id) {
            return {
              ...p,
              reviewer_id: selectedReviewer,
              reviewer: { id: selectedReviewer, name: reviewers.find((r) => r.id === selectedReviewer)?.name },
            }
          }
          return p
        })
        setProposals(updatedProposals)
        setShowAssignModal(false)
        setSelectedReviewer("")
        setAdminNotes("")
      })
      .catch((err) => {
        console.error("Error assigning reviewer:", err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminSidePanel activeTab={"proposals"} />

      <main className="flex-1 ml-64 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Research Proposals</h1>
              <p className="text-slate-400">Manage and assign reviewers for submitted research proposals</p>
            </div>
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-300">Signed in as:</p>
              <p className="text-lg font-semibold text-white">{currentUser?.name || "—"}</p>
              <p className="text-xs text-indigo-400">{currentUser?.role || "—"}</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Total Proposals</p>
              <p className="text-3xl font-bold text-blue-400">{proposals.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Under Review</p>
              <p className="text-3xl font-bold text-yellow-400">
                {proposals.filter((p) => p.status === "under_review").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-slate-400">Unassigned</p>
              <p className="text-3xl font-bold text-indigo-400">{proposals.filter((p) => !p.reviewer).length}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-slate-400">No proposals to review at this time.</p>
            </div>
          ) : (
            <>
              {proposals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((paper) => (
              <div
                key={paper.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all backdrop-blur-sm group"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{paper.title}</h3>
                        <p className="text-sm text-slate-400">
                          Submitted by <span className="text-slate-300 font-medium">{paper.user?.name}</span> •{" "}
                          {new Date(paper.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Reviewer</p>
                        <p className="text-sm font-medium text-white">
                          {paper.reviewer?.name ? (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              {paper.reviewer.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not assigned</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                        <p className="text-sm text-slate-400">{paper.user?.email}</p>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {paper.admin_notes && (
                      <div className="mt-4 p-3 bg-indigo-500/10 border-l-2 border-indigo-500 rounded">
                        <p className="text-xs text-indigo-400 uppercase tracking-wide mb-1">Admin Notes</p>
                        <p className="text-sm text-slate-300">{paper.admin_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        paper.status === "submitted"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : paper.status === "under_review"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : paper.status === "approved"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : paper.status === "rejected"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      }`}
                    >
                      {paper.status.replace("_", " ").toUpperCase()}
                    </span>

                    <div className="flex gap-2 flex-col sm:flex-row">
                      {paper.file_path && (
                        <a
                          href={`/api/papers/${paper.id}/download`}
                          className="px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-600/50"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPaper(paper)
                          setShowAssignModal(true)
                        }}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg font-medium transition-all"
                      >
                        {paper.reviewer ? "Change" : "Assign"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ))}

              {/* Pagination Controls */}
              {Math.ceil(proposals.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-between mt-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm">
                  <div className="text-sm text-slate-400">
                    Page {currentPage} of {Math.ceil(proposals.length / itemsPerPage)} • Showing {Math.min((currentPage - 1) * itemsPerPage + 1, proposals.length)} - {Math.min(currentPage * itemsPerPage, proposals.length)} of {proposals.length} proposals
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-slate-600/50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(proposals.length / itemsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(proposals.length / itemsPerPage)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all border border-indigo-500/30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Assign Reviewer Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Assign Reviewer</h2>
                <p className="text-sm text-indigo-100 mt-1">{selectedPaper?.title}</p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Reviewer</label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">Choose a reviewer...</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name} ({reviewer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Admin Notes (Optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    rows="3"
                    placeholder="Add any notes for the reviewer..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-700/30 px-6 py-4 flex gap-3 border-t border-slate-700">
                <button
                  onClick={handleAssignReviewer}
                  disabled={loading || !selectedReviewer}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-600 disabled:to-slate-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-all"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedReviewer("")
                    setAdminNotes("")
                  }}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-lg font-medium transition-colors border border-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminProposal
