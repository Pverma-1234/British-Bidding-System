import React, { useState, useEffect } from 'react';
import { rfqService } from '../services/api';
import RFQCard from '../components/RFQCard';
import { RFQCardSkeleton } from '../components/Skeletons';
import { LayoutGrid, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const res = await rfqService.getAllRFQs();
      setRfqs(res);
      setError(null);
    } catch (err) {
      setError('Failed to fetch auctions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="w-64 h-8 bg-[#E5E7EB] rounded-md animate-pulse mb-3"></div>
            <div className="w-96 h-4 bg-[#F3F4F6] rounded-md animate-pulse"></div>
          </div>
          <div className="w-24 h-10 bg-[#E5E7EB] rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <RFQCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 style={{ color: '#111827' }} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Auction Dashboard
          </h1>
          <p style={{ color: '#6B7280' }} className="mt-2 max-w-2xl">
            Monitor and participate in real-time RFQ British auctions. Ranks update instantly as new bids are placed.
          </p>
        </div>
        <button
          onClick={fetchRFQs}
          style={{
            color: '#111827',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }} className="rounded-xl p-6 text-center">
          <p style={{ color: '#EF4444' }} className="font-medium">{error}</p>
        </div>
      ) : rfqs.length === 0 ? (
        <div
          style={{ backgroundColor: '#FFFFFF', border: '2px dashed #E5E7EB' }}
          className="rounded-2xl p-20 text-center"
        >
          <div style={{ backgroundColor: '#F9FAFB' }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8" style={{ color: '#6B7280' }} />
          </div>
          <h3 style={{ color: '#111827' }} className="text-lg font-bold mb-2">No auctions found</h3>
          <p style={{ color: '#6B7280' }} className="max-w-xs mx-auto mb-6">Create your first RFQ auction to start receiving supplier bids.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rfqs.map((rfq) => (
            <RFQCard key={rfq._id} rfq={rfq} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
