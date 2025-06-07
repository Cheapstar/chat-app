"use client";
import React, { useState, useEffect } from "react";
import {
  LuMessageCircle,
  LuMic,
  LuShare2,
  LuZap,
  LuUsers,
  LuGlobe,
  LuSearch,
  LuPlay,
  LuStar,
  LuShield,
  LuMenu,
  LuX,
  LuSend,
  LuSmartphone,
} from "react-icons/lu";

export default function ChatAppHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <LuMic className="w-8 h-8" />,
      title: "Voice Messages",
      description:
        "Crystal-clear sound recording with one-tap functionality. Share your thoughts instantly with rich audio quality.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: <LuShare2 className="w-8 h-8" />,
      title: "File Sharing",
      description:
        "Share documents, images, videos, and any file type seamlessly. No size limits, lightning-fast transfers.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <LuZap className="w-8 h-8" />,
      title: "Instant Messages",
      description:
        "Real-time messaging with read receipts, typing indicators, and emoji reactions for engaging conversations.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: <LuUsers className="w-8 h-8" />,
      title: "Groups",
      description:
        "Create unlimited groups with up to 1000+ members. Perfect for teams, families, and friend circles.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <LuGlobe className="w-8 h-8" />,
      title: "Communities",
      description:
        "Join public communities based on your interests. Connect with like-minded people worldwide.",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      icon: <LuSearch className="w-8 h-8" />,
      title: "Smart LuSearch",
      description:
        "Find any message, file, or contact instantly with our AI-powered Lusearch that understands context.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content:
        "This chat app revolutionized how our team communicates. The voice messages and file sharing are game-changers!",
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Designer",
      content:
        "Finally, a chat app that's both beautiful and functional. The community features helped me connect with fellow designers.",
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Student",
      content:
        "The Lusearch functionality is incredible. I can find any conversation or file from months ago in seconds!",
      avatar: "ED",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <LuMessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChatFlow</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reviews
              </a>
              <a
                href="/signin"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <LuX className="w-6 h-6" />
              ) : (
                <LuMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-gray-900"
              >
                Features
              </a>
              <a
                href="#about"
                className="block text-gray-600 hover:text-gray-900"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="block text-gray-600 hover:text-gray-900"
              >
                Reviews
              </a>
              <a
                href="/signin"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Chat Without
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Limits
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the future of communication with voice messages,
                  instant file sharing, smart communities, and AI-powered
                  Lusearch. Connect like never before.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/signin"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <LuPlay className="w-5 h-5 mr-2" />
                  Start Chatting Now
                </a>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-gray-600">10M+ Luusers</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <LuStar
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    4.9/5 rating
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Alex</div>
                      <div className="text-sm text-gray-500">Online</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md p-3 max-w-xs">
                      <p className="text-sm text-gray-800">
                        Hey! Check out this new feature 🚀
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-md p-3 max-w-xs ml-auto">
                      <p className="text-sm">
                        Wow, the voice messages are amazing!
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md p-3 max-w-xs flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                        <LuMic className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">0:15</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to stay connected, share ideas, and build
              communities in one beautiful app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">10M+</div>
              <div className="text-blue-100">Active LuUsers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">5B+</div>
              <div className="text-blue-100">Messages Sent</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-blue-100">Communities</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-20 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by LuUsers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say about ChatFlow
            </p>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {testimonials[currentTestimonial]!.avatar}
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <LuStar
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-4 italic">
                  "{testimonials[currentTestimonial]!.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial]!.name}
                  </div>
                  <div className="text-gray-500">
                    {testimonials[currentTestimonial]!.role}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial
                      ? "bg-blue-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of Luusers who have already discovered the future of
            chatting. Get Lustarted today and experience the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signin"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <LuSend className="w-5 h-5 mr-2" />
              LuStart Chatting Free
            </a>
            <button className="border-2 border-gray-400 text-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-gray-300 hover:text-white transition-all duration-200">
              Download App
            </button>
          </div>

          <div className="mt-8 flex justify-center items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <LuShield className="w-4 h-4 text-green-400" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center space-x-2">
              <LuShield className="w-4 h-4 text-blue-400" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <LuSmartphone className="w-4 h-4 text-purple-400" />
              <span>All platforms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <LuMessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ChatFlow</span>
              </div>
              <p className="text-gray-400">
                Connecting people through powerful, intuitive communication
                tools.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  API
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Mobile Apps
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Status
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Community
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Careers
                </a>
                <a
                  href="#"
                  className="block hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ChatFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
