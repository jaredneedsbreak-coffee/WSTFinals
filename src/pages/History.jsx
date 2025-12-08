"use client"

import { useState, useEffect } from "react"
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import SidePanel from "../components/SidePanel"
import api from "../api"

function History() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUserPapers()
  }, [])

  const fetchUserPapers = async () => {
    try {
      const res = await api.get("/papers/my-papers")
      const completedPapers = res.data.papers.filter((p) =>
        ["approved", "rejected", "revision_needed"].includes(p.status),
      )
      setPapers(completedPapers)
    } catch (err) {
      console.error("Error fetching papers:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadEditedFile = async (paper) => {
    try {
      const response = await api.get(`/papers/${paper.id}/download`, { responseType: "blob" })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = paper.file_path.split("/").pop() || `paper-${paper.id}-edited.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert("Error downloading file: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeletePaper = async (paperId) => {
    setDeleting(true)
    try {
      await api.delete(`/papers/${paperId}`)
      setPapers(papers.filter((p) => p.id !== paperId))
      setDeleteConfirm(null)
      alert("✅ Paper deleted successfully!")
    } catch (err) {
      alert("Error deleting paper: " + (err.response?.data?.message || err.message))
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case "rejected":
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      case "revision_needed":
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-slate-500" />
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
      revision_needed: { bg: "bg-orange-100", text: "text-orange-700", label: "Revision Needed" },
    }
    const config = statusConfig[status] || { bg: "bg-slate-100", text: "text-slate-700", label: status }
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>{config.label}</span>
    )
  }

  const totalPages = Math.ceil(papers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPapers = papers.slice(startIndex, endIndex)

  return (
    <div className="flex h-screen bg-slate-50">
      <SidePanel />

      <div className="flex-1 ml-64 p-8 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Submission History</h1>
          <p className="text-slate-600 mt-2">View and manage your submitted research papers</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <DocumentTextIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <p className="text-slate-600 text-lg">Loading your submissions...</p>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 p-12 rounded-xl text-center">
            <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-900 text-lg font-semibold">No papers submitted yet</p>
            <p className="text-slate-600 text-sm mt-1">Go to your dashboard and submit your first research paper!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Reviewer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPapers.map((paper, index) => (
                    <tr
                      key={paper.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <DocumentTextIcon className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 line-clamp-1">{paper.title}</p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                              {(paper.abstract || "").substring(0, 80)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(paper.status)}
                          {getStatusBadge(paper.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{paper.reviewer?.name || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(paper.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {paper.file_path && (
                            <button
                              onClick={() => downloadEditedFile(paper)}
                              title="Download reviewed file"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(paper.id)}
                            title="Delete paper"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, papers.length)}</span> of{" "}
                  <span className="font-medium">{papers.length}</span> papers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirm(null)}
          ></div>

          <div className="relative bg-white p-6 rounded-xl shadow-xl w-96 animate-slideUp z-10">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Paper</h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this paper? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeletePaper(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
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
    </div>
  )
}

export default History
