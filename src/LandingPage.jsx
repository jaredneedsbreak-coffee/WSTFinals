import React from "react";
import { useNavigate } from "react-router-dom";
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

function LandingPage() {
  const navigate = useNavigate();

  // Smooth scroll handler (adjust for navbar height)
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // adjust based on navbar height
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#D3DAD9] text-[#37353E]">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-[#37353E] shadow-md fixed w-full top-0 left-0 z-50">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#D3DAD9] cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Research<span className="text-[#715A5A]">Ethics</span>
        </div>

        {/* Middle Nav Links */}
        <div className="hidden md:flex gap-8 text-[#D3DAD9] font-medium">
          <button
            onClick={() => handleScroll("about")}
            className="hover:text-[#715A5A] transition-all flex items-center gap-1"
          >
            <InformationCircleIcon className="w-5 h-5" />
            About
          </button>
          <button
            onClick={() => handleScroll("features")}
            className="hover:text-[#715A5A] transition-all flex items-center gap-1"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            Features
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 border border-[#D3DAD9] text-[#D3DAD9] rounded-lg hover:bg-[#D3DAD9] hover:text-[#37353E] transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2 bg-[#715A5A] text-[#D3DAD9] font-semibold rounded-lg hover:bg-[#8A6D6D] transition-all"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="flex flex-col items-center justify-center flex-1 text-center px-6 min-h-screen bg-[#D3DAD9] pt-32"
      >
        <h1 className="text-5xl font-extrabold mb-6 text-[#37353E] animate-slide-up">
          Empowering Ethical Research, One Step at a Time
        </h1>
        <p className="text-lg text-[#44444E] max-w-2xl mb-8 animate-fade-in-delay">
          Streamline proposal reviews, ensure compliance, and uphold integrity —
          all through a centralized, intuitive platform for research ethics.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-3 bg-[#37353E] text-[#D3DAD9] rounded-xl text-lg hover:bg-[#44444E] transition-all shadow-lg"
        >
          Get Started
        </button>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-24 px-10 bg-[#44444E] text-[#D3DAD9] text-center"
      >
        <div className="flex flex-col items-center animate-fade-in">
          <InformationCircleIcon className="w-14 h-14 text-[#715A5A] mb-4 animate-bounce" />
          <h2 className="text-4xl font-bold mb-6 text-[#D3DAD9]">About Us</h2>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed">
            ResearchEthics is built to revolutionize the research approval
            process. Our system empowers institutions to uphold transparency,
            accountability, and fairness in research ethics review. We simplify
            the workflow for both researchers and review committees — all within
            a secure, unified environment.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-10 bg-[#D3DAD9] text-center animate-fade-in"
      >
        <div className="flex flex-col items-center mb-10">
          <ShieldCheckIcon className="w-14 h-14 text-[#715A5A] mb-3 animate-pulse" />
          <h2 className="text-4xl font-bold text-[#37353E]">Key Features</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-[#44444E] text-[#D3DAD9] rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300 animate-slide-up">
            <ClipboardDocumentCheckIcon className="w-10 h-10 text-[#715A5A] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Smart Proposal Tracking</h3>
            <p>
              Submit, edit, and monitor your research proposals seamlessly with
              real-time status updates and ethical compliance alerts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#44444E] text-[#D3DAD9] rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300 animate-slide-up delay-200">
            <UsersIcon className="w-10 h-10 text-[#715A5A] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Reviewer Collaboration</h3>
            <p>
              Engage multiple reviewers, share feedback instantly, and ensure
              transparency in every step of the review process.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#44444E] text-[#D3DAD9] rounded-2xl p-8 shadow-lg hover:scale-105 transition-transform duration-300 animate-slide-up delay-300">
            <ShieldCheckIcon className="w-10 h-10 text-[#715A5A] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Secure Data Management</h3>
            <p>
              Protect sensitive information with encrypted data storage and
              institutional-grade access control.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[#44444E] border-t border-[#BFC6C5]">
        © {new Date().getFullYear()} ResearchEthics. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
