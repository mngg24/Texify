import React, { useState } from 'react';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { ResultViewer } from './components/ResultViewer';
import { convertDocToLatex, convertLatexToDoc } from './services/geminiService';
import { fileToBase64, readTextFile } from './utils';
import { ConversionMode, Status, FileData } from './types';
import { Upload, FileType, ArrowRightLeft, AlertCircle, FileCode } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>(ConversionMode.DOC_TO_LATEX);
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Input States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);
  const [latexInput, setLatexInput] = useState<string>('');
  
  // Output State
  const [result, setResult] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
          'application/pdf', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid PDF or DOCX file.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setStatus(Status.IDLE);
    }
  };

  const handleStyleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.name.endsWith('.tex')) {
            setError('Style file must be a .tex file.');
            return;
        }
        setStyleFile(file);
        setError(null);
    }
  }

  const processDocToLatex = async () => {
    if (!selectedFile) return;

    setStatus(Status.UPLOADING);
    try {
      // Convert file to base64
      const base64 = await fileToBase64(selectedFile);
      const fileData: FileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        base64: base64
      };

      let styleContent = undefined;
      if (styleFile) {
        styleContent = await readTextFile(styleFile);
      }

      setStatus(Status.PROCESSING);
      const latex = await convertDocToLatex(fileData, styleContent);
      setResult(latex);
      setStatus(Status.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(Status.ERROR);
    }
  };

  const processLatexToDoc = async () => {
    if (!latexInput.trim()) return;

    setStatus(Status.PROCESSING);
    try {
      const docHtml = await convertLatexToDoc(latexInput);
      setResult(docHtml);
      setStatus(Status.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(Status.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex items-center shadow-xl">
            <button
              onClick={() => {
                  setMode(ConversionMode.DOC_TO_LATEX);
                  setStatus(Status.IDLE);
                  setResult('');
                  setError(null);
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                mode === ConversionMode.DOC_TO_LATEX 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileType className="w-4 h-4" />
              File to LaTeX
            </button>
            <button
              onClick={() => {
                  setMode(ConversionMode.LATEX_TO_DOC);
                  setStatus(Status.IDLE);
                  setResult('');
                  setError(null);
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                mode === ConversionMode.LATEX_TO_DOC 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              LaTeX to Document
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
          
          {/* Input Section */}
          <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-850/50 backdrop-blur flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {mode === ConversionMode.DOC_TO_LATEX ? "Input Document" : "Input LaTeX Code"}
              </h2>
              {status === Status.PROCESSING && (
                <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                  <Spinner />
                  <span>Processing...</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-6">
              {mode === ConversionMode.DOC_TO_LATEX ? (
                <>
                    {/* Main File Input */}
                    <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 hover:bg-slate-900/50 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center relative group cursor-pointer">
                    <input 
                        type="file" 
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center pointer-events-none">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition-colors">
                        {selectedFile ? <FileType className="w-8 h-8 text-indigo-400" /> : <Upload className="w-8 h-8 text-slate-400" />}
                        </div>
                        {selectedFile ? (
                        <div className="space-y-1">
                            <p className="text-white font-medium">{selectedFile.name}</p>
                            <p className="text-slate-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        ) : (
                        <div className="space-y-2">
                            <p className="text-white font-medium">Drop PDF or DOCX here</p>
                            <p className="text-slate-500 text-sm">or click to browse files</p>
                        </div>
                        )}
                    </div>
                    </div>

                    {/* Style File Input */}
                    <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Sample Style File (.tex) <span className="text-slate-500 text-xs">(Optional)</span></label>
                            {styleFile && (
                                <button onClick={() => setStyleFile(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                            )}
                        </div>
                        <div className="relative flex items-center gap-3">
                             <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                                <FileCode className="w-5 h-5 text-indigo-400" />
                             </div>
                             <div className="flex-1 overflow-hidden">
                                 {styleFile ? (
                                     <p className="text-sm text-white truncate">{styleFile.name}</p>
                                 ) : (
                                     <p className="text-sm text-slate-500">Upload a .tex file to match its formatting</p>
                                 )}
                             </div>
                             <input 
                                type="file" 
                                accept=".tex"
                                onChange={handleStyleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                        </div>
                    </div>
                </>
              ) : (
                <textarea
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  placeholder="\documentclass{article}..."
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Action Button */}
              <div>
                <button
                  onClick={mode === ConversionMode.DOC_TO_LATEX ? processDocToLatex : processLatexToDoc}
                  disabled={status === Status.PROCESSING || (mode === ConversionMode.DOC_TO_LATEX && !selectedFile) || (mode === ConversionMode.LATEX_TO_DOC && !latexInput)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                  {status === Status.PROCESSING ? (
                    <>Thinking...</>
                  ) : (
                    <>
                      {mode === ConversionMode.DOC_TO_LATEX ? "Convert to LaTeX" : "Convert to Document"}
                      <ArrowRightLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <ResultViewer 
            content={result} 
            type={mode === ConversionMode.DOC_TO_LATEX ? 'latex' : 'html'} 
          />
          
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-500 text-sm">
            Supports PDF and DOCX inputs. 
            {mode === ConversionMode.LATEX_TO_DOC && " Generates HTML documents compatible with Word and PDF printers."}
          </p>
        </div>

      </main>
    </div>
  );
};

export default App;