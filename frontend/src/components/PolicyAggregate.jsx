import React, { useState } from 'react';
import axios from '../api/axios';

const ClientCard = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);

  // Select a warm premium gradient bg based on index
  const gradients = [
    'from-orange-500 to-amber-500 text-white',
    'from-amber-500 to-yellow-500 text-white',
    'from-red-500 to-orange-500 text-white',
    'from-orange-400 to-amber-600 text-white',
    'from-yellow-500 to-orange-600 text-white'
  ];
  const gradientClass = gradients[index % gradients.length];

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-350 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-sm">
      {/* Header section with User details & Initials Avatar */}
      <div className="bg-slate-50/60 px-5 py-4 border-b border-slate-150 flex items-center space-x-3.5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-100 flex-shrink-0 tracking-wide`}>
          {getInitials(item.userName)}
        </div>
        <div className="truncate flex-1">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 truncate" title={item.userName}>
            {item.userName || 'Unknown User'}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5" title={item.userEmail}>
            {item.userEmail}
          </span>
        </div>
      </div>

      {/* Body section */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Policies
            </span>
            <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              {item.totalPolicies} {item.totalPolicies === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          {/* Toggle Accordion Container */}
          {expanded && (
            <div className="mt-3.5 space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin animate-fade-in-up duration-200">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ingested policy numbers
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.policies.map((policy, idx) => {
                  const policyNo = typeof policy === 'object' ? policy.policyNumber : policy;
                  return (
                    <span 
                      key={idx} 
                      className="bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg transition-all cursor-default"
                      title={policyNo}
                    >
                      {policyNo}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Expand / Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1.5 ${
            expanded 
              ? 'bg-slate-100/50 hover:bg-slate-100 border-slate-200 text-slate-700' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-orange-600 hover:text-orange-700 shadow-sm'
          }`}
        >
          <span>{expanded ? 'Hide Ingested Details' : 'View Ingested Details'}</span>
          <svg 
            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const PolicyAggregate = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const loadAggregation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('/policy/aggregate');
      if (response.data.success) {
        setData(response.data.data);
        setLoaded(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching aggregated data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const name = item.userName?.toLowerCase() || '';
    const email = item.userEmail?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="mt-2">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Load button */}
        <button 
          onClick={loadAggregation}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl disabled:from-orange-700/50 disabled:to-amber-700/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-md shadow-orange-100 active:scale-95 uppercase tracking-wider"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Compiling Pipelines...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              <span>{loaded ? 'Reload Aggregation' : 'Load Aggregation'}</span>
            </>
          )}
        </button>

        {/* Aggregate Search input */}
        {loaded && data.length > 0 && (
          <div className="relative w-full sm:w-72 animate-fade-in-up duration-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 shadow-sm"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2.5 shadow-sm">
          <svg className="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loaded && filteredData.length === 0 && (
        <div className="text-slate-400 text-center py-12 text-sm bg-slate-50/50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-2.5 shadow-inner">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-slate-600">No clients match your filter</span>
        </div>
      )}

      {loaded && filteredData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredData.map((item, index) => (
            <ClientCard key={item._id || index} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PolicyAggregate;
