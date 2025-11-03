import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

function SidePanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: HomeIcon, path: "/dashboard" },
    { name: "History", icon: ClockIcon, path: "/history" },
    { name: "Submission", icon: DocumentTextIcon, path: "/submission" },
    { name: "About", icon: InformationCircleIcon, path: "/about" },
    { name: "Contact", icon: PhoneIcon, path: "/contact" },
  ];

  const [hovered, setHovered] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Side Panel */}
      <div className="w-64 min-h-screen bg-[#37353E] text-[#D3DAD9] flex flex-col justify-between p-6 shadow-xl animate-fadeIn">
        {/* Top Nav */}
        <div className="flex flex-col gap-3">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-300 transform 
                  ${isActive ? "bg-[#715A5A]" : "hover:bg-[#44444E]"} 
                  ${hovered === idx ? "scale-105" : "scale-100"}
                `}
              >
                <Icon
                  className={`h-6 w-6 text-[#715A5A] ${isActive ? "text-[#D3DAD9] animate-bounce" : ""}`}
                />
                <span className={`${isActive ? "font-bold text-[#D3DAD9]" : "font-semibold"}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#44444E] transition-all duration-300 transform hover:scale-105 mt-6"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 text-[#715A5A]" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-opacity-40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-[#37353E] text-[#D3DAD9] p-6 rounded-2xl shadow-xl w-80 animate-slideUp z-10">
            <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-[#44444E] rounded-lg hover:bg-[#715A5A] transition-all"
              >
                <XMarkIcon className="h-5 w-5 text-[#D3DAD9]" />
                Cancel
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-4 py-2 bg-[#715A5A] rounded-lg hover:bg-[#D3DAD9] hover:text-[#37353E] transition-all"
              >
                <CheckIcon className="h-5 w-5 text-[#D3DAD9]" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

export default SidePanel;
