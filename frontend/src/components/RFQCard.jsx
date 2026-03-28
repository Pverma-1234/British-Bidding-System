import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Activity } from 'lucide-react';
import { format } from 'date-fns';
import CountdownTimer from './CountdownTimer';

const RFQCard = ({ rfq }) => {
  const isClosed = new Date() > new Date(rfq.bidCloseTime);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
      }}
      className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group ${isClosed ? 'opacity-75' : ''}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div style={{ backgroundColor: '#F9FAFB', color: '#6B7280' }} className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            {rfq.status}
          </div>
          <CountdownTimer targetDate={rfq.bidCloseTime} />
        </div>

        <h3 style={{ color: '#111827' }} className="text-xl font-bold mb-2 group-hover:text-[#4F46E5] transition-colors">
          {rfq.name}
        </h3>

        <div className="space-y-2 mb-6">
          <div style={{ color: '#6B7280' }} className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Started: {format(new Date(rfq.startTime), 'MMM dd, HH:mm')}</span>
          </div>
          <div style={{ color: '#6B7280' }} className="text-sm">
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
