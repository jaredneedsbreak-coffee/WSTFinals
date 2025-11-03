import React, { useState } from "react";
import SidePanel from "../components/SidePanel";
import {
  UserIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function UserDashboard() {
  // Example data
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Ethics Proposal Submission",
      type: "Activity",
      date: "2025-11-05",
      description: "Submit your research proposal for review.",
    },
    {
      id: 2,
      title: "Monthly Review Meeting",
      type: "Event",
      date: "2025-11-10",
      description: "Join the committee meeting to discuss pending proposals.",
    },
    {
      id: 3,
      title: "New Guidelines Announcement",
      type: "Announcement",
      date: "2025-11-01",
      description: "Updated ethical guidelines for human subject research.",
    },
  ]);

  return (
    <div className="min-h-screen flex bg-[#D3DAD9] animate-fadeIn">
      {/* Side Panel */}
      <SidePanel />

      {/* Main Dashboard */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Header */}
        <header className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-[#37353E] flex items-center gap-2">
            <UserIcon className="h-8 w-8 text-[#715A5A]" />
            Dashboard
          </h1>
        </header>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#37353E] text-[#D3DAD9] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <ClipboardDocumentCheckIcon className="h-10 w-10 text-[#715A5A] mb-2 animate-bounce" />
            <h2 className="text-xl font-semibold mb-1">Activities</h2>
            <p className="text-sm text-[#D3DAD9]">
              {posts.filter((p) => p.type === "Activity").length}
            </p>
          </div>

          <div className="bg-[#37353E] text-[#D3DAD9] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <CalendarDaysIcon className="h-10 w-10 text-[#715A5A] mb-2 animate-bounce" />
            <h2 className="text-xl font-semibold mb-1">Events</h2>
            <p className="text-sm text-[#D3DAD9]">
              {posts.filter((p) => p.type === "Event").length}
            </p>
          </div>

          <div className="bg-[#37353E] text-[#D3DAD9] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col items-center">
            <BellIcon className="h-10 w-10 text-[#715A5A] mb-2 animate-bounce" />
            <h2 className="text-xl font-semibold mb-1">Announcements</h2>
            <p className="text-sm text-[#D3DAD9]">
              {posts.filter((p) => p.type === "Announcement").length}
            </p>
          </div>
        </div>

        {/* Posts List */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#44444E] p-5 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 animate-slideUp"
            >
              <h3 className="text-xl font-semibold mb-2 text-[#D3DAD9]">{post.title}</h3>
              <p className="text-sm text-[#D3DAD9] mb-1">{post.date}</p>
              <p className="text-[#D3DAD9]">{post.description}</p>
            </div>
          ))}
        </section>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default UserDashboard;
