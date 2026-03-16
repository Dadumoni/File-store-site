import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Share2, TrendingUp, Download } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">TeleShare Earn</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-emerald-600 transition-colors">Login</Link>
            <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Share Files, <span className="text-emerald-600">Earn Rewards</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto">
              The ultimate Telegram file sharing platform. Upload your files, share with your audience, and earn money for every view and download.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-neutral-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg">
                Start Uploading Now
              </Link>
              <a href="#features" className="w-full sm:w-auto border border-neutral-200 px-8 py-4 rounded-xl font-medium hover:bg-neutral-100 transition-all">
                How it Works
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-white border-y border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">High CPM Rates</h3>
                <p className="text-neutral-600">Get the best rewards for your traffic. We offer competitive rates for every unique view.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Secure & Reliable</h3>
                <p className="text-neutral-600">Your files are safe with us. We use enterprise-grade storage and security protocols.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Fast Downloads</h3>
                <p className="text-neutral-600">No waiting times or slow speeds. Your users get direct access to their files instantly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-sm">
          <p>© 2026 TeleShare Earn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
