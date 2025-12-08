import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import api from "../api";
import { BellIcon, XMarkIcon, CalendarIcon, PlusIcon } from "@heroicons/react/24/outline";

const Announcements = forwardRef(function Announcements({ showCreateForm = false, theme = "light" }, ref) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState(null); // null, 'announcement', or 'event'
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibleTo, setVisibleTo] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Expose openModal method to parent component via ref
  useImperativeHandle(ref, () => ({
    openModal: () => setShowModal(true),
  }));

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await api.post("/admin/announcements", {
        title,
        body,
        visible_to: visibleTo,
        type: postType,
      });
      setTitle("");
      setBody("");
      setVisibleTo("all");
      setPostType(null);
      setMessage("✅ Post created successfully!");
      fetchAnnouncements();
      setTimeout(() => {
        setMessage("");
        setShowModal(false);
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  // Separate announcements and events
  const announcementsList = announcements.filter(a => a.type === 'announcement' || !a.type);
  const eventsList = announcements.filter(a => a.type === 'event');

  // Theme configuration
  const themeConfig = {
    light: {
      buttonBg: "bg-emerald-500",
      buttonHover: "hover:bg-emerald-600",
      buttonText: "text-white",
      borderColor: "border-emerald-300",
      primaryColor: "text-indigo-600",
      primaryColorLight: "text-indigo-500",
      iconColor: "text-indigo-600",
      modalBg: "bg-white",
      modalBorder: "border-indigo-200",
      inputBg: "bg-emerald-50",
      inputText: "text-emerald-700",
      inputBorder: "border-emerald-200",
      inputFocus: "focus:ring-emerald-500",
      announcementBg: "bg-indigo-50",
      announcementBorder: "border-indigo-300",
      eventBg: "bg-amber-50",
      eventBorder: "border-amber-300",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600",
    },
    dark: {
      buttonBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
      buttonHover: "hover:from-indigo-700 hover:to-violet-700",
      buttonText: "text-white",
      borderColor: "border-indigo-500/50",
      primaryColor: "text-indigo-400",
      primaryColorLight: "text-indigo-300",
      iconColor: "text-indigo-400",
      modalBg: "bg-slate-800",
      modalBorder: "border-indigo-500",
      inputBg: "bg-slate-700",
      inputText: "text-white",
      inputBorder: "border-indigo-500/30",
      inputFocus: "focus:ring-indigo-500",
      announcementBg: "bg-slate-700/50",
      announcementBorder: "border-indigo-500",
      eventBg: "bg-slate-700/50",
      eventBorder: "border-violet-500",
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-400",
    },
  };

  const colors = themeConfig[theme] || themeConfig.light;

  return (
    <div className="w-full">
      {showCreateForm && !ref && (
        <button
          onClick={() => setShowModal(true)}
          className={`mb-6 flex items-center gap-2 ${colors.buttonBg} ${colors.buttonText} px-4 py-2 rounded-lg font-semibold ${colors.buttonHover} transition`}
        >
          <PlusIcon className="h-5 w-5" />
          Post
        </button>
      )}

      {/* Post Type Selection Modal */}
      {showCreateForm && showModal && !postType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className={`relative ${colors.modalBg} border-2 ${colors.modalBorder} p-8 rounded-2xl shadow-2xl max-w-md w-full animate-slideUp z-10`}>
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 ${colors.primaryColor} transition opacity-75 hover:opacity-100`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className={`text-2xl font-bold mb-6 ${colors.primaryColor}`}>What would you like to post?</h2>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPostType('announcement')}
                className={`w-full flex items-center gap-3 p-4 border-2 ${colors.borderColor} rounded-lg ${theme === 'light' ? 'hover:bg-emerald-50' : 'hover:bg-slate-600/50'} transition text-left`}
              >
                <BellIcon className={`h-6 w-6 ${colors.primaryColor} flex-shrink-0`} />
                <div>
                  <p className={`font-semibold ${colors.primaryColor}`}>Announcement</p>
                  <p className={`text-sm ${colors.primaryColorLight} opacity-75`}>Share news and updates</p>
                </div>
              </button>

              <button
                onClick={() => setPostType('event')}
                className={`w-full flex items-center gap-3 p-4 border-2 ${colors.borderColor} rounded-lg ${theme === 'light' ? 'hover:bg-violet-50' : 'hover:bg-slate-600/50'} transition text-left`}
              >
                <CalendarIcon className={`h-6 w-6 ${colors.primaryColor} flex-shrink-0`} />
                <div>
                  <p className={`font-semibold ${colors.primaryColor}`}>Event</p>
                  <p className={`text-sm ${colors.primaryColorLight} opacity-75`}>Announce upcoming events</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateForm && showModal && postType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowModal(false); setPostType(null); }}
          ></div>

          <div className={`relative ${colors.modalBg} border-2 ${colors.modalBorder} p-8 rounded-2xl shadow-2xl max-w-md w-full animate-slideUp z-10`}>
            <button
              onClick={() => { setShowModal(false); setPostType(null); }}
              className={`absolute top-4 right-4 ${colors.primaryColor} transition opacity-75 hover:opacity-100`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className={`text-2xl font-bold mb-6 ${colors.primaryColor}`}>
              {postType === 'announcement' ? 'Post Announcement' : 'Post Event'}
            </h2>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div>
                <label className={`text-sm font-semibold ${colors.primaryColor} block mb-2`}>Title</label>
                <input
                  type="text"
                  placeholder={postType === 'announcement' ? 'Announcement Title' : 'Event Title'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full ${colors.inputBg} ${colors.inputText} p-3 rounded-lg outline-none focus:ring-2 ${colors.inputFocus} border ${colors.inputBorder}`}
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${colors.primaryColor} block mb-2`}>Message</label>
                <textarea
                  placeholder={postType === 'announcement' ? 'Announcement Body' : 'Event Details'}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={`w-full ${colors.inputBg} ${colors.inputText} p-3 rounded-lg outline-none focus:ring-2 ${colors.inputFocus} border ${colors.inputBorder}`}
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-semibold ${colors.primaryColor} block mb-2`}>Visible To</label>
                <select
                  value={visibleTo}
                  onChange={(e) => setVisibleTo(e.target.value)}
                  className={`w-full ${colors.inputBg} ${colors.inputText} p-2 rounded-lg outline-none focus:ring-2 ${colors.inputFocus} border ${colors.inputBorder}`}
                >
                  <option value="all">Everyone</option>
                  <option value="user">Users Only</option>
                  <option value="reviewer">Reviewers Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 ${colors.buttonBg} ${colors.buttonText} py-2 rounded-lg font-semibold ${colors.buttonHover} transition ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Posting..." : "Post"}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPostType(null); }}
                  className={`flex-1 ${theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-slate-600 text-slate-100 hover:bg-slate-500'} py-2 rounded-lg font-semibold transition`}
                >
                  Cancel
                </button>
              </div>

              {message && (
                <p className={`text-center ${colors.primaryColor} font-semibold text-sm`}>{message}</p>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Announcements Section */}
        <div>
          <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${colors.primaryColor}`}>
            <BellIcon className={`h-6 w-6 ${colors.iconColor}`} />
            Announcements
          </h3>
          {loading ? (
            <p>Loading announcements...</p>
          ) : announcementsList.length === 0 ? (
            <p className={colors.textSecondary}>No announcements at this time.</p>
          ) : (
            <div className="space-y-3">
              {announcementsList.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`${colors.announcementBg} border-l-4 ${colors.announcementBorder} ${colors.textPrimary} p-4 rounded-lg shadow`}
                >
                  <h4 className="font-bold text-lg mb-1">{announcement.title}</h4>
                  <p className="text-sm mb-2">{announcement.body}</p>
                  <p className={`text-xs ${colors.textSecondary}`}>
                    {new Date(announcement.created_at).toLocaleDateString()} at{" "}
                    {new Date(announcement.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${colors.primaryColor}`}>
            <CalendarIcon className={`h-6 w-6 ${colors.iconColor}`} />
            Events
          </h3>
          {loading ? (
            <p>Loading events...</p>
          ) : eventsList.length === 0 ? (
            <p className={colors.textSecondary}>No events at this time.</p>
          ) : (
            <div className="space-y-3">
              {eventsList.map((event) => (
                <div
                  key={event.id}
                  className={`${colors.eventBg} border-l-4 ${colors.eventBorder} ${colors.textPrimary} p-4 rounded-lg shadow`}
                >
                  <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                  <p className="text-sm mb-2">{event.body}</p>
                  <p className={`text-xs ${colors.textSecondary}`}>
                    {new Date(event.created_at).toLocaleDateString()} at{" "}
                    {new Date(event.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Announcements;
