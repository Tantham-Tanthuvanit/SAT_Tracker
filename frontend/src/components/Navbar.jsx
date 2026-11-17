import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Smartphone, 
  Download, 
  Upload, 
  Sparkles, 
  MoreVertical,
  Activity
} from 'lucide-react';

export default function Navbar({ onOpenAdd, onOpenNetwork, onSeedData, onExport, onImport }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">SAT Tracker</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  LAN Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Track test progression & analytics</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connect Mobile Button */}
            <button
              onClick={onOpenNetwork}
              title="Open on phone or local network"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/70 hover:border-indigo-500/50 transition cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Connect Phone</span>
              <span className="md:hidden">LAN</span>
            </button>

            {/* Add Score Button (Primary CTA) */}
            <button
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Score</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-transparent hover:border-slate-800 transition cursor-pointer"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-scale-in text-sm">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onSeedData();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Seed Sample Tests</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onExport();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Export JSON Backup</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Import JSON Backup</span>
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
