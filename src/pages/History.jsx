import React, { useState } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import SidePanel from "../components/SidePanel";

function History() {
  const [historyItems] = useState([
    {
      id: 1,
      title: "Proposal Submitted",
      type: "Activity",
      date: "2025-10-25",
      description: "Submitted ethics proposal for review.",
    },
    {
      id: 2,
      title: "Review Meeting",
      type: "Event",
      date: "2025-10-28",
      description: "Attended the monthly review meeting.",
    },
    {
      id: 3,
      title: "Guidelines Updated",
      type: "Announcement",
      date: "2025-10-30",
      description: "Updated ethics guidelines published.",
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case "Activity":
        return <DocumentTextIcon className="h-8 w-8 text-[#715A5A] animate-bounce" />;
      case "Event":
        return <ClockIcon className="h-8 w-8 text-[#715A5A] animate-bounce" />;
      case "Announcement":
        return <BellIcon className="h-8 w-8 text-[#715A5A] animate-bounce" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#D3DAD9] animate-fadeIn">
      <SidePanel />

      <div className="flex-1 p-6 flex flex-col">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#37353E]">History</h1>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#44444E] p-5 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 animate-slideUp"
            >
              <div className="flex items-center gap-3 mb-3">
                {getIcon(item.type)}
                <h3 className="text-xl font-semibold text-[#D3DAD9]">{item.title}</h3>
              </div>
              <p className="text-sm text-[#D3DAD9] mb-1">{item.date}</p>
              <p className="text-[#D3DAD9]">{item.description}</p>
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

export default History;
