import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auto-append '/api' if it's missing from the base URL
if (apiURL && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  apiURL = apiURL.endsWith('/') ? `${apiURL}api` : `${apiURL}/api`;
}

export default axios.create({
  baseURL: apiURL
});
