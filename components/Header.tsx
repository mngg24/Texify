import React from 'react';
import { FileText, Code2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/20">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Texify</h1>
            <p className="text-xs text-slate-400 font-medium">AI-Powered LaTeX Converter</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
             <FileText className="w-4 h-4" />
             <span>Powered by Gemini 2.5</span>
           </a>
        </div>
      </div>
    </header>
  );
};