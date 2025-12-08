"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline"

function LandingPage() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    "https://i.pinimg.com/1200x/56/38/8b/56388bb6fa1a94c6571b476659943358.jpg",
    "https://i.pinimg.com/736x/47/4a/f0/474af0605649505500a2fcac5379e8a4.jpg",
    "https://i.pinimg.com/1200x/29/8a/4d/298a4dd7865add740eb6eab743f7e669.jpg",
    "https://i.pinimg.com/1200x/c9/63/0c/c9630c96fa93e0a5373404533cf61e53.jpg",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handleScroll = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src="https://minsu.edu.ph/template/images/logo.png" alt="ResearchEthics Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-slate-900">
              Research<span className="text-indigo-600">Ethics</span>
            </span>
          </div>

          <div className="hidden md:flex gap-12 text-slate-600 font-medium">
            <button
              onClick={() => handleScroll("features")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Features
            </button>
            <button
              onClick={() => handleScroll("about")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              <InformationCircleIcon className="w-4 h-4" />
              About
            </button>
            <button
              onClick={() => handleScroll("statistics")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              Statistics
            </button>
            <button
              onClick={() => handleScroll("howItWorks")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScroll("benefits")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              Benefits
            </button>
            <button
              onClick={() => handleScroll("testimonials")}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors duration-200"
            >
              Testimonials
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-slate-600 font-medium hover:text-indigo-600 transition-colors duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <section
        id="hero"
        className="flex flex-col items-center justify-center text-center px-6 min-h-screen pt-24 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Empowering Ethical <span className="text-indigo-600">Research</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Streamline proposal reviews, ensure compliance, and uphold integrity — all through a centralized, intuitive
            platform for research ethics.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </section>

      <section className="relative w-full h-96 lg:h-[500px] overflow-hidden">
        <img
          src={slides[currentSlide] || "/placeholder.svg"}
          alt="Research ethics visual"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 animate-fade"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 flex flex-col justify-center items-center text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">Research Integrity in Action</h2>
          <p className="max-w-2xl text-lg lg:text-xl text-slate-100 animate-fade-in-delay">
            Every idea deserves an ethical foundation — fostering trust, fairness, and progress.
          </p>
        </div>
      </section>

      <section
        id="statistics"
        className="py-20 lg:py-28 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">Trusted by Leading Institutions</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-5xl lg:text-6xl font-bold mb-2">500+</div>
              <p className="text-lg text-indigo-100">Active Institutions</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-5xl lg:text-6xl font-bold mb-2">50K+</div>
              <p className="text-lg text-indigo-100">Proposals Reviewed</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-5xl lg:text-6xl font-bold mb-2">99.9%</div>
              <p className="text-lg text-indigo-100">Uptime Guarantee</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-5xl lg:text-6xl font-bold mb-2">24/7</div>
              <p className="text-lg text-indigo-100">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      <section id="howItWorks" className="py-20 lg:py-28 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Simple process, powerful results</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative animate-slide-up">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Proposal</h3>
                <p className="text-slate-600">Researchers submit their proposals through our secure portal</p>
              </div>
              {/* Connector line */}
              <div
                className="hidden md:block absolute top-8 left-full w-6 h-1 bg-indigo-200"
                style={{ marginLeft: "-12px" }}
              ></div>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Review & Assess</h3>
                <p className="text-slate-600">Ethics committee reviews and provides feedback on compliance</p>
              </div>
              <div
                className="hidden md:block absolute top-8 left-full w-6 h-1 bg-indigo-200"
                style={{ marginLeft: "-12px" }}
              ></div>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Revise & Resubmit</h3>
                <p className="text-slate-600">Researchers make improvements based on recommendations</p>
              </div>
              <div
                className="hidden md:block absolute top-8 left-full w-6 h-1 bg-indigo-200"
                style={{ marginLeft: "-12px" }}
              ></div>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Get Approval</h3>
                <p className="text-slate-600">Receive final approval and begin ethical research</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 lg:py-28 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <InformationCircleIcon className="w-14 h-14 text-indigo-400" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">About ResearchEthics</h2>
          <p className="text-lg lg:text-xl text-slate-300 leading-relaxed">
            ResearchEthics is designed to uphold the highest standards of academic integrity. We simplify proposal
            reviews, support transparent evaluation, and promote ethical accountability — empowering institutions and
            researchers to make responsible discoveries.
          </p>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex justify-center mb-4">
              <ShieldCheckIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Key Features</h2>
            <p className="text-xl text-slate-600">Comprehensive tools designed for modern research institutions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white border-2 border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:shadow-lg transition-all duration-300 animate-slide-up">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors duration-300">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Smart Proposal Tracking</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Submit, edit, and monitor research proposals seamlessly with real-time updates and compliance insights.
              </p>
            </div>

            <div
              className="group bg-white border-2 border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors duration-300">
                  <UsersIcon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Reviewer Collaboration</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Streamline communication and maintain transparency between reviewers and researchers throughout the
                review process.
              </p>
            </div>

            <div
              className="group bg-white border-2 border-slate-200 rounded-xl p-8 hover:border-indigo-600 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors duration-300">
                  <ShieldCheckIcon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">Secure Data Management</h3>
              <p className="text-slate-600 text-center leading-relaxed">
                Protect sensitive documents with institutional-grade security and encrypted cloud-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 lg:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Why Choose ResearchEthics?</h2>
            <p className="text-xl text-slate-600">Industry-leading platform for research integrity</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 animate-slide-up">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Bank-Level Security</h3>
                <p className="text-slate-600">
                  Military-grade encryption and compliance with international data protection standards
                </p>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Seamless Collaboration</h3>
                <p className="text-slate-600">
                  Built-in communication tools for reviewers and researchers to work together efficiently
                </p>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Compliance</h3>
                <p className="text-slate-600">
                  AI-powered system ensures proposals meet all ethical and institutional requirements
                </p>
              </div>
            </div>

            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600">
                  <InformationCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Expert Support</h3>
                <p className="text-slate-600">
                  Dedicated team of research ethics specialists available to guide your institution
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 lg:py-28 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-300">
              Hear from institutions transforming their research ethics processes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-indigo-500 transition-colors duration-300 animate-slide-up">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-bold">Dr. Sarah Mitchell</h4>
                  <p className="text-sm text-slate-400">Research Director, Top University</p>
                </div>
              </div>
              <p className="text-slate-300">
                "ResearchEthics has reduced our review time by 40% while improving consistency across committees. Highly
                recommended!"
              </p>
            </div>

            <div
              className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-indigo-500 transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-bold">Prof. James Chen</h4>
                  <p className="text-sm text-slate-400">Ethics Committee Chair, Research Institute</p>
                </div>
              </div>
              <p className="text-slate-300">
                "The intuitive interface and comprehensive tracking tools make it easy for our team to maintain ethical
                standards across all proposals."
              </p>
            </div>

            <div
              className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-indigo-500 transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gracie"
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-bold">Dr. Emma Rodriguez</h4>
                  <p className="text-sm text-slate-400">Compliance Officer, Medical Center</p>
                </div>
              </div>
              <p className="text-slate-300">
                "Outstanding platform! The security features and compliance tracking give us confidence in our ethical
                oversight processes."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Your Research Ethics Process?</h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join 500+ institutions already using ResearchEthics to streamline proposals and uphold integrity.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
          >
            Start Your Free Trial
          </button>
          <p className="text-indigo-100 text-sm mt-4">No credit card required. Setup takes less than 5 minutes.</p>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-600 border-t border-slate-200 bg-slate-50">
        © {new Date().getFullYear()} ResearchEthics. All rights reserved.
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade {
          animation: fade 1s ease-in-out;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade 1.2s ease-in-out 0.4s forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fade 1s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LandingPage
