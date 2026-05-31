import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import StatsDashboard from '../components/StatsDashboard';
import axios from '../api/axios';

const IngestPage = () => {
  const [stats, setStats] = useState({
    totalPolicies: 0,
    totalUsers: 0,
    totalLOBs: 0,
    totalCarriers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/policy/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header section */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-orange-200 bg-orange-50/60 text-orange-655 text-orange-600 text-xs font-bold mb-4 shadow-sm animate-pulse">
          <span>Technical Assessment • Step 1</span>
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-orange-600 bg-clip-text text-transparent">
          Policy Management Portal
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
          Manage, search, and compile aggregated report pipelines across customer policies with offloaded processing.
        </p>
      </div>

      {/* Global stats dashboard */}
      <StatsDashboard stats={stats} loading={loading} />

      {/* Ingestion Area */}
      <div className="space-y-10">
        <section 
          id="upload" 
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up delay-200"
        >
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span>1. Ingest Insurance Data</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Upload Excel (.xlsx) or CSV documents containing accounts, companies, and policy details.</p>
          </div>
          <FileUpload onUploadSuccess={fetchStats} />
        </section>
      </div>
    </div>
  );
};

export default IngestPage;
