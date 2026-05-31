import React, { useState } from 'react';
import axios from '../api/axios';
import { useToast } from '../context/ToastContext';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const validateFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setMessage('');
      } else {
        setFile(null);
        setError('Only .xlsx and .csv files are allowed.');
        showToast('Only .xlsx and .csv files are allowed.', 'error');
      }
    }
  };

  const handleFileChange = (e) => {
    validateFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        const msg = `${response.data.inserted || 0} policy records uploaded and processed successfully!`;
        setMessage(msg);
        setFile(null);
        showToast(msg, 'success', 5000);
        if (onUploadSuccess) {
          onUploadSuccess(); // Refresh stats counters
        }
      } else {
        const errMsg = response.data.message || 'Upload failed';
        setError(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error uploading file';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (name) => {
    return name.split('.').pop().toLowerCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group shadow-sm flex flex-col items-center justify-center ${
          isDragging 
            ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' 
            : 'border-slate-200 hover:border-orange-500/60 hover:bg-slate-50/60 bg-slate-50/20'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          accept=".xlsx, .csv" 
          onChange={handleFileChange} 
        />
        <div className={`mx-auto h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-300 mb-4 ${
          isDragging 
            ? 'bg-orange-100 text-orange-600 border-orange-205 border-orange-200 scale-110' 
            : 'bg-slate-50 text-slate-505 text-slate-500 border-slate-200 group-hover:scale-110 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100'
        }`}>
          <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-705 text-slate-700">
          Drag and drop your policy file here, or <span className="text-orange-600 group-hover:underline">browse files</span>
        </p>
        <p className="text-xs text-slate-400 mt-2 font-semibold">Supports Microsoft Excel (.xlsx) and CSV (.csv) formats (Max 10MB)</p>
      </div>

      {file && (
        <div className="mt-5 p-4 bg-white rounded-2xl border border-slate-200/80 flex justify-between items-center shadow-md animate-fade-in-up duration-200">
          <div className="flex items-center space-x-3.5 truncate">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 font-extrabold text-[10px] uppercase ${
              getFileExtension(file.name) === 'xlsx'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-orange-50 text-orange-600 border-orange-150 border-orange-200'
            }`}>
              {getFileExtension(file.name)}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Cancel Button */}
            {!loading && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={loading}
              className={`px-4.5 py-2 rounded-xl text-white text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                loading 
                  ? 'bg-orange-600/40 cursor-not-allowed text-orange-100' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-95 shadow-md shadow-orange-100'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upload Data</span>
              )}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-5 p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-3 shadow-[0_2px_10px_rgba(16,185,129,0.05)] animate-fade-in-up duration-250">
          <div className="p-1 rounded bg-emerald-100 text-emerald-600 border border-emerald-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mt-5 p-4 bg-rose-50/80 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-3 shadow-[0_2px_10px_rgba(244,63,94,0.05)] animate-fade-in-up duration-250">
          <div className="p-1 rounded bg-rose-100 text-rose-600 border border-rose-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
