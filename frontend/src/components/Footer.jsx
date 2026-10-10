import React from 'react';
import { Heart, Coffee, Wallet } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Expense Tracker <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              v1.0
            </span>
          </div>

          {/* Inspirational Quote */}
          <div className="max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            &ldquo;Beware of little expenses; a small leak will sink a great ship.&rdquo;
            <span className="block not-italic text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              — Benjamin Franklin
            </span>
          </div>

          {/* Built with love quote */}
          <p className="flex items-center justify-center flex-wrap gap-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Built with lots of love</span>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>&amp; cups of chai</span>
            <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
            <span>by</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-4">
              Rishav Ranjan
            </span>
          </p>

          {/* Copyright notice */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <p>
              &copy; {currentYear} Expense Tracker Pro. Copyright by{' '}
              <span className="font-medium text-slate-600 dark:text-slate-300">Rishav Ranjan</span>.
            </p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
