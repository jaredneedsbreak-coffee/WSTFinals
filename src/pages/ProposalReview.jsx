"use client"

import { useEffect, useState, useRef } from "react"
import api from "../api"
import ReviewerSidePanel from "../components/ReviewerSidePanel"
import { DocumentIcon, ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

function ProposalReview() {
  const [papers, setPapers] = useState([])
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [status, setStatus] = useState("approved")
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [fileViewerUrl, setFileViewerUrl] = useState("")
  const [viewingPaper, setViewingPaper] = useState(null)
  const [editingPaper, setEditingPaper] = useState(null)
  const [editorHtml, setEditorHtml] = useState("")
  const [saveStatus, setSaveStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [alertModal, setAlertModal] = useState({ show: false, message: "", type: "success" })
  const itemsPerPage = 5
  const saveTimer = useRef(null)
  const editorRef = useRef(null)
  const editorInstanceRef = useRef(null)

  useEffect(() => {
    fetchAssigned()
  }, [])

  useEffect(() => {
    if (editingPaper && editorRef.current) {
      ClassicEditor.create(editorRef.current, {
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "undo",
          "redo",
        ],
        ui: {
          viewportOffset: {
            top: 0,
            bottom: 0,
          },
        },
      })
        .then((editor) => {
          editorInstanceRef.current = editor
          editor.setData(editorHtml)
          
          // Style the editor for visibility
          const editorElement = editor.ui.getEditableElement()
          if (editorElement) {
            editorElement.style.color = "#000"
            editorElement.style.backgroundColor = "#fff"
          }
          
          editor.model.document.on("change:data", () => {
            const newHtml = editor.getData()
            setEditorHtml(newHtml)
            scheduleSave(editingPaper.id, newHtml)
          })
        })
        .catch((error) => {
          console.error("CKEditor initialization error:", error)
        })
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {})
        editorInstanceRef.current = null
      }
    }
  }, [editingPaper])

  const fetchAssigned = async () => {
    try {
      const res = await api.get("/reviewer/papers")
      setPapers(res.data.papers)
    } catch (err) {
      console.error("Error fetching assigned papers", err)
    }
  }

  const openPaper = (p) => {
    setSelected(p)
    setFeedback(p.feedback || "")
    setStatus(p.status === "under_review" ? "approved" : p.status)
  }

  const openFileViewer = (p) => {
    if (p.file_path) {
      setViewingPaper(p)
      const token = sessionStorage.getItem("token")
      const fileUrl = `http://127.0.0.1:8000/api/papers/${p.id}/view?token=${token}`
      setFileViewerUrl(fileUrl)
      setShowFileViewer(true)
    }
  }

  const openEditor = async (p) => {
    try {
      const res = await api.get(`/papers/${p.id}/editor-content`)
      setEditingPaper(p)
      setEditorHtml(res.data.html || "<p></p>")
    } catch (err) {
      setAlertModal({ show: true, message: err.response?.data?.message || "Editor not available for this file", type: "error" })
    }
  }

  const scheduleSave = (paperId, html) => {
    setSaveStatus("Saving...")
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await api.post(`/papers/${paperId}/save-edited`, { edited_html: html })
        setSaveStatus("Saved")
        setTimeout(() => setSaveStatus(""), 2000)
      } catch (err) {
        console.error("Autosave error:", err.response?.data || err)
        setSaveStatus("Save failed")
      }
    }, 1500)
  }

  const downloadFile = async () => {
    const paper = viewingPaper || selected
    if (!paper) return
    try {
      const response = await api.get(`/papers/${paper.id}/download`, { responseType: "blob" })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = paper.file_path.split("/").pop() || "paper.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setAlertModal({ show: true, message: err.response?.data?.message || "Error downloading file", type: "error" })
    }
  }

  const submitFeedback = async () => {
    if (!selected) return
    try {
      await api.post(`/papers/${selected.id}/feedback`, { feedback, status })
      setAlertModal({ show: true, message: "Feedback submitted", type: "success" })
      setSelected(null)
      fetchAssigned()
    } catch (err) {
      setAlertModal({ show: true, message: err.response?.data?.message || "Error submitting feedback", type: "error" })
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <ReviewerSidePanel activeTab={"proposals"} />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Assigned Papers for Review
          </h1>
          <p className="text-slate-400">Review and provide comprehensive feedback on assigned research papers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-3 ${showFileViewer || editingPaper || selected ? "pointer-events-none opacity-50" : ""}`}>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
                <h2 className="text-lg font-bold">Papers for Review ({papers.length})</h2>
                <p className="text-indigo-100 text-sm mt-1">Review queue</p>
              </div>

              {papers.length === 0 ? (
                <div className="p-12 text-center">
                  <DocumentIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400 text-lg">No papers assigned yet</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-700/30">
                          <th className="px-6 py-4 text-left text-sm font-bold text-indigo-300">Title</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-indigo-300">Author</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-indigo-300">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-indigo-300">Submitted</th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-indigo-300">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {papers
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((p) => (
                            <tr
                              key={p.id}
                              className={`border-b border-slate-700 hover:bg-slate-700/50 transition ${
                                selected?.id === p.id ? "bg-indigo-900/30" : ""
                              }`}
                            >
                              <td className="px-6 py-4 text-sm font-semibold text-slate-100">{p.title}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">{p.user?.name}</td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                                    p.status === "under_review"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : p.status === "approved"
                                        ? "bg-green-500/20 text-green-300"
                                        : p.status === "rejected"
                                          ? "bg-red-500/20 text-red-300"
                                          : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {p.status.replace("_", " ").toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {new Date(p.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => openPaper(p)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-700/20">
                    <p className="text-sm text-slate-400">
                      Page {currentPage} of {Math.ceil(papers.length / itemsPerPage)} • Showing{" "}
                      {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, papers.length)} of {papers.length} papers
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold text-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(Math.ceil(papers.length / itemsPerPage), currentPage + 1)
                          )
                        }
                        disabled={currentPage === Math.ceil(papers.length / itemsPerPage)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
                  <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-indigo-100">
                    <span>By: {selected.user?.name}</span>
                    <span>•</span>
                    <span>Status: {selected.status.replace("_", " ").toUpperCase()}</span>
                  </div>
                </div>

                {/* Paper Info and Viewer */}
                <div className="p-6">
                  {selected.file_path && (
                    <div className="mb-6 p-4 bg-slate-700/30 border border-slate-700 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <DocumentIcon className="h-6 w-6 text-indigo-400" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-100">Paper File</p>
                          <p className="text-sm text-slate-400">{selected.file_path.split("/").pop()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(selected.file_path || "").toLowerCase().match(/\.docx?$|\.doc$/) && (
                          <button
                            onClick={() => openEditor(selected)}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                          >
                            Edit Online
                          </button>
                        )}
                        <button
                          onClick={downloadFile}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-lg transition font-semibold"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-indigo-300 block mb-2">Your Feedback</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={6}
                        placeholder="Provide detailed feedback for the researcher..."
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-indigo-300 block mb-2">Decision</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                        <option value="revision_needed">Request Revision</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={submitFeedback}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition font-semibold"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setSelected(null)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-3 rounded-lg transition font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-12 text-center backdrop-blur-sm">
                <DocumentIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-200">Select a paper to review</p>
                <p className="text-slate-400 mt-2">
                  Click the Review button on any paper to view details and submit feedback
                </p>
              </div>
            )}
          </div>
        </div>

        {showFileViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowFileViewer(false)}
            ></div>
            <div className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] z-10 overflow-hidden flex flex-col border border-slate-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">Document Review</p>
                  <p className="text-sm text-indigo-100">{viewingPaper?.title}</p>
                </div>
                <button
                  onClick={() => setShowFileViewer(false)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Document Viewer */}
                <div className="flex-1 overflow-auto bg-white flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-md w-full h-full">
                    <iframe
                      src={fileViewerUrl}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      title="File Viewer"
                      allow="fullscreen"
                    />
                  </div>
                </div>

                {/* Annotation Panel */}
                <div className="w-80 bg-slate-800/50 border-l border-slate-700 overflow-auto flex flex-col">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-indigo-300 mb-2">Review Notes</h3>
                    <p className="text-xs text-slate-400">Add your inline notes and annotations here</p>
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-auto">
                    <div className="bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/50">
                      <p className="text-xs font-semibold text-indigo-300 mb-1">Tip</p>
                      <p className="text-xs text-indigo-200">
                        You can add annotations, highlights, and comments as you review.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-indigo-300 block">General Notes</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add your review notes here..."
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Annotation Panel Footer */}
                  <div className="p-4 border-t border-slate-700 space-y-3">
                    <label className="text-sm font-semibold text-indigo-300 block">Decision</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-100 focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="approved">✓ Approve</option>
                      <option value="rejected">✗ Reject</option>
                      <option value="revision_needed">→ Request Revision</option>
                    </select>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={downloadFile}
                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition font-semibold text-sm"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => setShowFileViewer(false)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-2 rounded-lg transition font-semibold text-sm"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingPaper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingPaper(null)}></div>
            <div className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] z-10 overflow-hidden flex flex-col border border-slate-700">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Online Editor</p>
                  <p className="text-sm text-indigo-100">{editingPaper.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-100 text-sm">{saveStatus}</span>
                  <button
                    onClick={() => setEditingPaper(null)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-white p-4">
                <div ref={editorRef} className="bg-white rounded-lg overflow-hidden"></div>
              </div>
            </div>
          </div>
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

export default ProposalReview
