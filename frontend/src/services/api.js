const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

import nprogress from 'nprogress';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  nprogress.start();
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } finally {
    nprogress.done();
  }
};

export const rfqService = {
  createRFQ: (data) => fetchWithAuth('/rfq', { method: 'POST', body: JSON.stringify(data) }),
  getAllRFQs: () => fetchWithAuth('/rfq', { method: 'GET' }),
  getRFQById: (id) => fetchWithAuth(`/rfq/${id}`, { method: 'GET' }),
};

export const bidService = {
  placeBid: (rfqId, data) => fetchWithAuth(`/bid/${rfqId}`, { method: 'POST', body: JSON.stringify(data) }),
  getBidsByRFQ: (rfqId) => fetchWithAuth(`/bid/${rfqId}`, { method: 'GET' }),
};
