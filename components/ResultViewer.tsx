import React, { useState } from 'react';
import { Copy, Download, Check, Eye, Code } from 'lucide-react';
import { downloadTextFile } from '../utils';

interface ResultViewerProps {
  content: string;
  type: 'latex' | 'html';
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ content, type }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = type === 'latex' ? 'tex' : 'html';
    downloadTextFile(`converted_output.${ext}`, content);
  };

  // Switch to preview automatically if type is html, but allow toggle
  React.useEffect(() => {
    if (type === 'html') setViewMode('preview');
    else setViewMode('code');
  }, [type]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-850/50 backdrop-blur">
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400 font-mono">
            {type === 'latex' ? 'main.tex' : 'output.html'}
            </span>
            {type === 'html' && (
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                    <button 
                        onClick={() => setViewMode('code')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'code' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="View Code"
                    >
                        <Code className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Preview"
                    >
                        <Eye className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-all"
            title="Download File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-slate-950">
        {type === 'html' && viewMode === 'preview' ? (
             <iframe 
             title="Preview"
             srcDoc={content}
             className="w-full h-full bg-white"
             sandbox="allow-same-origin"
           />
        ) : (
            <textarea
            readOnly
            value={content}
            className="w-full h-full p-4 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
            />
        )}
      </div>
    </div>
  );
};