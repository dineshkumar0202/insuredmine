import React, { useState } from 'react';
import axios from '../api/axios';

const PolicySearch = () => {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await axios.get(`/policy/search?username=${username}`);
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching policies');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Search by name, email, policy number, or policy ID..."
            className="w-full pl-4 pr-10 py-2.5 text-sm bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 shadow-sm"
          />
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="sm:w-36 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl disabled:from-orange-700/50 disabled:to-amber-700/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-md shadow-orange-100 active:scale-95 uppercase tracking-wider"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Searching...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2.5 shadow-sm">
          <svg className="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="text-slate-400 text-center py-12 text-sm bg-slate-50/50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center space-y-3 shadow-inner">
          <div className="p-3 rounded-full bg-slate-100 text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-600 block">No policies matching "{username}"</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Verify spelling or try uploading fresh policy records.</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-md">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy No.</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insurance Category</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carrier</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policyholder</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effective Term</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {results.map((policy) => (
                <tr key={policy._id} className="hover:bg-slate-50/60 transition-colors duration-200 group">
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                    <span className="font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-150 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                      {policy.policyNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <span className="bg-orange-50 text-orange-655 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-bold border border-orange-100 shadow-sm">
                      {policy.policyCategoryId?.categoryName || 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                    {policy.companyId?.companyName || 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">
                        {policy.userId?.firstName || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {policy.userId?.email || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <span>{formatDate(policy.policyStartDate)}</span>
                      <span className="text-slate-300 font-normal">→</span>
                      <span className="text-slate-600">{formatDate(policy.policyEndDate)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PolicySearch;
