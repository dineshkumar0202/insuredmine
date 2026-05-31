import React from 'react';

const StatsDashboard = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100">
      {/* Stat Card 1: Total Policies */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
        <div className="p-3.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Policies</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {loading ? (
              <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
            ) : (
              (stats?.totalPolicies || 0).toLocaleString()
            )}
          </span>
        </div>
      </div>

      {/* Stat Card 2: Customers */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
        <div className="p-3.5 rounded-xl bg-amber-55 bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Clients</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {loading ? (
              <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
            ) : (
              (stats?.totalUsers || 0).toLocaleString()
            )}
          </span>
        </div>
      </div>

      {/* Stat Card 3: Carriers */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
        <div className="p-3.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carriers</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {loading ? (
              <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
            ) : (
              (stats?.totalCarriers || 0).toLocaleString()
            )}
          </span>
        </div>
      </div>

      {/* Stat Card 4: Categories */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex items-center space-x-4 group">
        <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOB Categories</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {loading ? (
              <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
            ) : (
              (stats?.totalLOBs || 0).toLocaleString()
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
