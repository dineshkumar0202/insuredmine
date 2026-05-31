import React, { useState, useEffect, useRef } from 'react';

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const styles = {
  success: {
    bg: 'bg-white/90 border-emerald-500/20 text-emerald-800 shadow-[0_8px_30px_rgb(16,185,129,0.08)]',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    progress: 'bg-gradient-to-r from-emerald-400 to-teal-500'
  },
  error: {
    bg: 'bg-white/90 border-rose-500/20 text-rose-800 shadow-[0_8px_30px_rgb(244,63,94,0.08)]',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
    progress: 'bg-gradient-to-r from-rose-400 to-red-500'
  },
  warning: {
    bg: 'bg-white/90 border-amber-500/20 text-amber-800 shadow-[0_8px_30px_rgb(245,158,11,0.08)]',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
    progress: 'bg-gradient-to-r from-amber-400 to-orange-500'
  },
  info: {
    bg: 'bg-white/90 border-blue-500/20 text-blue-800 shadow-[0_8px_30px_rgb(59,130,246,0.08)]',
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
    progress: 'bg-gradient-to-r from-blue-400 to-indigo-500'
  }
};

const Toast = ({ id, message, type = 'success', duration = 4000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  
  const timeLeft = useRef(duration);
  const lastTick = useRef(Date.now());
  const timerId = useRef(null);

  const handleClose = () => {
    setIsExiting(true);
  };

  useEffect(() => {
    if (isExiting) {
      const timeout = setTimeout(() => {
        onClose(id);
      }, 350); // duration of slideOut animation
      return () => clearTimeout(timeout);
    }
  }, [isExiting, id, onClose]);

  useEffect(() => {
    if (isExiting) return;

    if (!isHovered) {
      lastTick.current = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - lastTick.current;
        lastTick.current = Date.now();
        timeLeft.current = Math.max(0, timeLeft.current - elapsed);
        
        setProgress((timeLeft.current / duration) * 100);
        
        if (timeLeft.current <= 0) {
          clearInterval(interval);
          handleClose();
        }
      }, 20); // 50fps smooth updates
      
      timerId.current = interval;
      return () => clearInterval(interval);
    } else {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    }
  }, [isHovered, isExiting, duration]);

  const config = styles[type] || styles.success;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-80 border backdrop-blur-md rounded-2xl p-4 flex flex-col overflow-hidden pointer-events-auto transition-all duration-300 transform ${
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      } ${config.bg}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-1.5 rounded-xl flex-shrink-0 ${config.iconBg}`}>
            {icons[type]}
          </div>
          <div className="flex-1 pt-0.5">
            <h4 className="text-xs font-bold capitalize text-slate-800 leading-none">
              {type}
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors flex-shrink-0 ml-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-1 bg-slate-100/50 mt-4 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-200 ease-out ${config.progress}`}
          style={{ width: `${progress}%`, transitionDuration: '20ms' }}
        />
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
