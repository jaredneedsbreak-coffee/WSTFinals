"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SidePanel from "../components/SidePanel"
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ArrowRightIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline"
import api from "../api"

function SubmissionStatus() {
  const navigate = useNavigate()
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [resubmitFile, setResubmitFile] = useState(null)
  const [resubmitting, setResubmitting] = useState(false)
  const [resubmitMessage, setResubmitMessage] = useState("")

  const getProgressPercentage = (status) => {
    switch (status) {
      case "approved":
        return 100
      case "rejected":
        return 0
      case "revision_needed":
        return 50
      case "under_review":
        return 75
      case "submitted":
        return 25
      default:
        return 0
    }
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case "approved":
        return "Your submission has been approved."
      case "rejected":
        return "Your submission has been rejected."
      case "revision_needed":
        return "Your submission needs revision. Please review the feedback and resubmit."
      case "under_review":
        return "Your submission is currently under review."
      case "submitted":
        return "Your submission has been submitted."
      default:
        return "Your submission is in an unknown state."
    }
  }

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await api.get("/papers/my-papers")
        console.log("Papers response:", response.data)
        const papersArray = response.data.papers || response.data || []
        console.log("Papers array:", papersArray)
        console.log("Paper statuses:", papersArray.map(p => ({ id: p.id, title: p.title, status: p.status })))
        setPapers(papersArray)
      } catch (err) {
        console.error("Error fetching papers:", err)
        setPapers([])
      } finally {
        setLoading(false)
      }
    }
    fetchPapers()
  }, [])

  const handleResubmitFile = async (paperId) => {
    if (!resubmitFile) {
      setResubmitMessage("Please select a file to resubmit")
      return
    }

    setResubmitting(true)
    setResubmitMessage("")

    try {
      const formData = new FormData()
      formData.append("paper", resubmitFile)
      
      const response = await api.post(`/papers/${paperId}/resubmit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setResubmitMessage("✅ Paper resubmitted successfully!")
      setResubmitFile(null)
      
      // Refresh papers list
      const updatedResponse = await api.get("/papers/my-papers")
      setPapers(updatedResponse.data.papers || updatedResponse.data || [])
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setResubmitMessage("")
        setSelectedPaper(null)
      }, 3000)
    } catch (error) {
      console.error("Error resubmitting paper:", error)
      setResubmitMessage(error.response?.data?.message || "❌ Failed to resubmit paper.")
    } finally {
      setResubmitting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
      case "rejected":
        return <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
      case "revision_needed":
        return <ExclamationCircleIcon className="h-12 w-12 text-amber-500" />
      case "under_review":
        return <ClockIcon className="h-12 w-12 text-indigo-500 animate-spin" />
      case "submitted":
        return <ClockIcon className="h-12 w-12 text-blue-500" />
      default:
        return <ClockIcon className="h-12 w-12 text-slate-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 border-emerald-200"
      case "rejected":
        return "bg-red-50 border-red-200"
      case "revision_needed":
        return "bg-amber-50 border-amber-200"
      case "under_review":
        return "bg-indigo-50 border-indigo-200"
      case "submitted":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-slate-50 border-slate-200"
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "revision_needed":
        return "bg-amber-100 text-amber-800"
      case "under_review":
        return "bg-indigo-100 text-indigo-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <SidePanel />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <ClockIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-slate-700 text-lg font-semibold">Loading your submissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SidePanel />

      <div className="flex-1 ml-64 p-8 flex flex-col overflow-y-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" />
            <h1 className="text-4xl font-bold text-slate-900">Submission Status</h1>
          </div>
          <p className="text-slate-600 text-lg">Track the progress of your research submissions</p>
        </header>

        {papers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center max-w-md">
              <div className="inline-block p-4 bg-slate-100 rounded-full mb-6">
                <ClockIcon className="h-12 w-12 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">No submissions yet</p>
              <p className="text-slate-600 mb-8">Submit your first research paper to get started</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.isArray(papers) && papers.length > 0 ? (
              papers
                .filter((paper) => paper.status !== "approved" && paper.status !== "rejected")
                .map((paper) => {
                  const isRevision = paper.status === "revision_needed"
                  const isExpanded = expandedId === paper.id

                  return (
                    <div
                      key={paper.id}
                    className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${getStatusColor(paper.status)}`}
                    onClick={() => setExpandedId(isExpanded ? null : paper.id)}
                  >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">{getStatusIcon(paper.status)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate">{paper.title}</h3>
                          <div className="flex flex-wrap gap-3 items-center">
                            <span className="text-sm text-slate-600">ID: {paper.id}</span>
                            <span className="text-sm text-slate-600">•</span>
                            <span className="text-sm text-slate-600">
                              Submitted {new Date(paper.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusBadgeColor(paper.status)}`}
                        >
                          {paper.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {(paper.status === "submitted" || paper.status === "under_review") && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-700">Progress</span>
                          <span className="text-sm font-bold text-indigo-600">
                            {getProgressPercentage(paper.status)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              paper.status === "approved"
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : paper.status === "rejected"
                                  ? "bg-gradient-to-r from-red-500 to-red-400"
                                  : paper.status === "revision_needed"
                                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                    : "bg-gradient-to-r from-indigo-600 to-blue-500"
                            }`}
                            style={{ width: `${getProgressPercentage(paper.status)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mb-6 space-y-4 bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Timeline</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">Submitted</p>
                            <p className="text-xs text-slate-600">{new Date(paper.created_at).toLocaleString()}</p>
                          </div>
                        </div>

                        {paper.reviewer && (
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                paper.status !== "submitted" ? "bg-yellow-500" : "bg-slate-300"
                              } mt-1.5 flex-shrink-0`}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">Under Review</p>
                              <p className="text-xs text-slate-600">
                                {paper.reviewer.name} ({paper.reviewer.email})
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{new Date(paper.updated_at).toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {paper.status === "revision_needed" && (
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">Sent Back for Revision</p>
                              <p className="text-xs text-slate-600">{new Date(paper.updated_at).toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {(paper.status === "approved" || paper.status === "rejected") && (
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                paper.status === "approved" ? "bg-emerald-500" : "bg-red-500"
                              } mt-1.5 flex-shrink-0`}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {paper.status === "approved" ? "Approved" : "Rejected"}
                              </p>
                              <p className="text-xs text-slate-600">{new Date(paper.updated_at).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-600 rounded-lg">
                      <p className="text-sm text-slate-800">{getStatusDescription(paper.status)}</p>
                    </div>

                    {isExpanded && (
                      <>
                        {paper.feedback && (
                          <div className="mb-6 p-4 bg-slate-100 rounded-xl border-l-4 border-blue-500">
                            <p className="font-semibold text-slate-900 mb-2 text-sm">Reviewer Feedback</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{paper.feedback}</p>
                          </div>
                        )}

                        {paper.admin_notes && (
                          <div className="mb-6 p-4 bg-slate-100 rounded-xl border-l-4 border-slate-500">
                            <p className="font-semibold text-slate-900 mb-2 text-sm">Admin Notes</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{paper.admin_notes}</p>
                          </div>
                        )}
                      </>
                    )}

                    {isRevision && (
                      <div className="mb-6 p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
                        <p className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                          <DocumentArrowUpIcon className="h-5 w-5" />
                          Resubmit Revised Paper
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-300 border-dashed rounded-lg cursor-pointer bg-amber-100/50 hover:bg-amber-100 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <DocumentArrowUpIcon className="h-8 w-8 text-amber-600 mb-2" />
                                <p className="text-sm text-amber-900">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-amber-700">PDF, DOC, DOCX up to 10MB</p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setResubmitFile(e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>

                          {resubmitFile && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                              <span className="text-sm text-slate-700 font-medium truncate">{resubmitFile.name}</span>
                              <button
                                onClick={() => setResubmitFile(null)}
                                className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )}

                          {resubmitMessage && (
                            <div
                              className={`p-3 rounded-lg text-sm font-medium ${
                                resubmitMessage.includes("✅")
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {resubmitMessage}
                            </div>
                          )}

                          <button
                            onClick={() => handleResubmitFile(paper.id)}
                            disabled={!resubmitFile || resubmitting}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            {resubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Resubmitting...
                              </>
                            ) : (
                              <>
                                <DocumentArrowUpIcon className="h-4 w-4" />
                                Resubmit Paper
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                      {isExpanded ? "Hide Details" : "View Full Details"}
                      <ArrowRightIcon
                        className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No papers submitted yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionStatus
