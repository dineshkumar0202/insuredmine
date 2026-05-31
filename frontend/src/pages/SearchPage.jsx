import React, { useState, useEffect } from 'react';
import PolicySearch from '../components/PolicySearch';
import StatsDashboard from '../components/StatsDashboard';
import axios from '../api/axios';

const SearchPage = () => {
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
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-orange-200 bg-orange-50/60 text-orange-600 text-xs font-bold mb-4 shadow-sm animate-pulse">
          <span>Technical Assessment • Step 2</span>
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

      {/* Search Area */}
      <div className="space-y-10">
        <section 
          id="search" 
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up delay-200"
        >
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span>2. Search Policies by Name or ID</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Retrieve detailed policy records by querying the name, email, policy number, or policy ID.</p>
          </div>
          <PolicySearch />
        </section>
      </div>
    </div>
  );
};

export default SearchPage;
