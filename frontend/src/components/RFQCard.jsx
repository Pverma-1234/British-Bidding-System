import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Activity, Trash2, TrendingDown, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import { useAuth } from '../context/AuthContext';
import { rfqService } from '../services/api';
import toast from 'react-hot-toast';

const RFQCard = ({ rfq, onDeleteSuccess }) => {
  const { user } = useAuth();
  const now = new Date().getTime();
  const start = new Date(rfq.startTime).getTime();
  const end = new Date(rfq.endTime).getTime();
  
  const isCreator = user && (user.id === rfq.createdBy?._id || user.id === rfq.createdBy);
  
  let displayStatus = 'LIVE 🟢';
  let statusColor = { bg: '#D1FAE5', text: '#065F46' };
  
  if (rfq.status === 'AWARDED') {
      displayStatus = 'AWARDED 🏆';
      statusColor = { bg: '#FEF08A', text: '#854D0E' };
  } else if (rfq.status === 'ENDED' || rfq.endedEarly || now >= end) {
      displayStatus = 'ENDED 🔴';
      statusColor = { bg: '#FEE2E2', text: '#B91C1C' };
  } else if (now < start) {
      displayStatus = 'UPCOMING 🟡';
      statusColor = { bg: '#FEF3C7', text: '#D97706' };
  }
  
  const isClosed = rfq.status === 'AWARDED' || rfq.status === 'ENDED' || rfq.endedEarly || now >= end;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this RFQ?")) return;
    try {
      await rfqService.deleteRFQ(rfq._id);
      if (onDeleteSuccess) {
          onDeleteSuccess(rfq._id);
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting RFQ');
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: '1px solid #E5E7EB',
      }}
      className={`relative rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group ${isClosed ? 'opacity-75' : ''}`}
    >
      {isCreator && rfq.status !== 'AWARDED' && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
          title="Delete RFQ"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 flex-wrap mb-4 pr-8">
          <div style={{ backgroundColor: statusColor.bg, color: statusColor.text }} className="badge font-bold uppercase tracking-wider">
            <span className="badge-text">
              <Activity className="w-3 h-3" />
              {displayStatus}
            </span>
          </div>
          <CountdownTimer rfq={rfq} />
        </div>

        <h3 style={{ color: "var(--text-primary)" }} className="text-xl font-bold mb-4 group-hover:text-[#4F46E5] transition-colors">
          {rfq.name}
        </h3>

        <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-500" /> Lowest Bid
            </p>
            <p className="text-lg font-extrabold text-emerald-600">
              {rfq.currentLowestBid ? `$${rfq.currentLowestBid.toLocaleString()}` : <span className="text-gray-400 text-sm italic">No bids yet</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center justify-end gap-1">
              Hard Deadline <ShieldAlert className="w-3 h-3 text-red-400" />
            </p>
            <p className="font-mono text-sm font-bold text-gray-800">
              {format(new Date(rfq.maxEndTime), 'HH:mm')}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div style={{ color: "var(--text-secondary)" }} className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Started: {format(new Date(rfq.startTime), 'MMM dd, HH:mm')}</span>
          </div>
          <div style={{ color: "var(--text-secondary)" }} className="text-sm">
            <span className="font-semibold">Trigger:</span> {rfq.extensionTriggerType} ({rfq.triggerWindow}m window)
          </div>
        </div>

        <div className="mt-auto">
          <Link
            to={`/rfq/${rfq._id}`}
            style={{ backgroundColor: '#4F46E5' }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white hover:bg-[#4338CA] transition-all shadow-sm group-hover:translate-y-[-2px]"
          >
            View Auction
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RFQCard;
