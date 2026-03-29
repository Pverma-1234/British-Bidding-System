import React, { useState, useEffect } from 'react';
import { rfqService, analyticsService } from '../services/api';
import socket, { connectSocket, disconnectSocket } from '../services/socket';
import toast from 'react-hot-toast';
import RFQCard from '../components/RFQCard';
import ThemeToggle from '../components/ThemeToggle';
import { RFQCardSkeleton } from '../components/Skeletons';
import { LayoutGrid, RefreshCw, BarChart3, Zap, Coins } from 'lucide-react';

const Dashboard = () => {
  const [rfqs, setRfqs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const [res, metricsRes] = await Promise.all([
         rfqService.getAllRFQs(),
         analyticsService.getRFQMetrics().catch(() => null)
      ]);
      setRfqs(res);
      setMetrics(metricsRes);
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
    connectSocket();

    socket.on('RFQ_DELETED', ({ rfqId }) => {
      setRfqs(prev => prev.filter(r => r._id !== rfqId));
    });

    return () => {
      socket.off('RFQ_DELETED');
      disconnectSocket();
    };
  }, []);

  const handleDeleteSuccess = (rfqId) => {
    setRfqs(prev => prev.filter(r => r._id !== rfqId));
    toast.success('RFQ deleted successfully');
  };

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
          <h1 style={{ color: "var(--text-primary)" }} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Auction Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="mt-2 max-w-2xl">
            Monitor and participate in real-time RFQ British auctions. Ranks update instantly as new bids are placed.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={fetchRFQs}
            style={{
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-secondary)",
              border: '1px solid #E5E7EB',
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid #E5E7EB' }} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div style={{ backgroundColor: '#EEF2FF' }} className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" style={{ color: '#4F46E5' }} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)" }} className="text-xs font-bold uppercase tracking-wider mb-1">Avg Bids / RFQ</p>
              <h4 style={{ color: "var(--text-primary)" }} className="text-2xl font-extrabold">{metrics.avgBidsPerRFQ || 0}</h4>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid #E5E7EB' }} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div style={{ backgroundColor: '#ECFDF5' }} className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" style={{ color: '#10B981', fill: '#10B981' }} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)" }} className="text-xs font-bold uppercase tracking-wider mb-1">Avg Bids (Extended vs Not)</p>
              <div className="flex items-baseline gap-2">
                <h4 style={{ color: '#10B981' }} className="text-2xl font-extrabold">{metrics.extendedStats?.avgBids || 0}</h4>
                <span className="text-sm font-bold text-gray-400">vs {metrics.nonExtendedStats?.avgBids || 0}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid #E5E7EB' }} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div style={{ backgroundColor: '#FEFCE8' }} className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" style={{ color: '#CA8A04' }} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)" }} className="text-xs font-bold uppercase tracking-wider mb-1">Total Extensions Savings</p>
              <h4 style={{ color: "var(--text-primary)" }} className="text-2xl font-extrabold">${Number(metrics.totalSavings || 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }} className="rounded-xl p-6 text-center">
          <p style={{ color: '#EF4444' }} className="font-medium">{error}</p>
        </div>
      ) : rfqs.length === 0 ? (
        <div
          style={{ backgroundColor: "var(--bg-secondary)", border: '2px dashed #E5E7EB' }}
          className="rounded-2xl p-20 text-center"
        >
          <div style={{ backgroundColor: "var(--bg-primary)" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8" style={{ color: "var(--text-secondary)" }} />
          </div>
          <h3 style={{ color: "var(--text-primary)" }} className="text-lg font-bold mb-2">No auctions found</h3>
          <p style={{ color: "var(--text-secondary)" }} className="max-w-xs mx-auto mb-6">Create your first RFQ auction to start receiving supplier bids.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rfqs.map((rfq) => (
            <RFQCard key={rfq._id} rfq={rfq} onDeleteSuccess={handleDeleteSuccess} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
