import React from 'react';
import { Heart, Coffee, Sparkles, Shield, Wallet } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-md text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">
              Expense Tracker <span className="text-indigo-600">Pro</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
              v1.0
            </span>
          </div>

          {/* Inspirational Quote */}
          <div className="max-w-xl text-xs sm:text-sm text-slate-500 italic bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 shadow-xs">
            &ldquo;Beware of little expenses; a small leak will sink a great ship.&rdquo;
            <span className="block not-italic text-[11px] font-medium text-slate-400 mt-0.5">
              — Benjamin Franklin
            </span>
          </div>

          {/* Built with love quote */}
          <p className="flex items-center justify-center flex-wrap gap-1.5 text-xs sm:text-sm font-medium text-slate-700">
            <span>Built with lots of love</span>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>&amp; cups of chai</span>
            <Coffee className="h-3.5 w-3.5 text-amber-600" />
            <span>by</span>
            <span className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-4">
              Rishav Ranjan
            </span>
          </p>

          {/* Copyright notice */}
          <div className="pt-2 border-t border-slate-100 w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400">
            <p>
              &copy; {currentYear} Expense Tracker Pro. Copyright by{' '}
              <span className="font-medium text-slate-600">Rishav Ranjan</span>.
            </p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
