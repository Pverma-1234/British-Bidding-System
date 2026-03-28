import React from 'react';
import RankBadge from './RankBadge';
import { format } from 'date-fns';

const BidTable = ({ bids }) => {
  if (!bids || bids.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} className="rounded-xl p-12 text-center">
        <p style={{ color: '#6B7280' }}>No bids placed yet.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} className="overflow-hidden rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Supplier</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Freight</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Origin</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Dest.</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Total</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Transit</th>
              <th style={{ color: '#6B7280' }} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Bid Time</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, idx) => {
              const isL1 = bid.rank === 1;
              return (
                <tr
                  key={bid._id}
                  style={{
                    backgroundColor: isL1 ? '#ECFDF5' : '#FFFFFF',
                    borderLeft: isL1 ? '4px solid #10B981' : '4px solid transparent',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                  className={`transition-all duration-300 ${isL1 ? 'shadow-[inset_0_0_0_1px_#A7F3D0]' : 'hover:bg-[#F9FAFB]'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isL1 ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold bg-[#D1FAE5] text-[#065F46] border border-[#10B981] shadow-sm animate-pulse">
                        <span>L1 🏆</span>
                      </div>
                    ) : (
                      <RankBadge rank={bid.rank} />
                    )}
                  </td>
                <td style={{ color: '#111827' }} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {bid.bidder?.name || 'Unknown'}
                </td>
                <td style={{ color: '#6B7280' }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.freightCharges.toLocaleString()}
                </td>
                <td style={{ color: '#6B7280' }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.originCharges.toLocaleString()}
                </td>
                <td style={{ color: '#6B7280' }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.destinationCharges.toLocaleString()}
                </td>
                <td style={{ color: '#111827' }} className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                  ${bid.totalBidValue.toLocaleString()}
                </td>
                <td style={{ color: '#6B7280' }} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {bid.transitTime} days
                </td>
                <td style={{ color: '#6B7280' }} className="px-6 py-4 whitespace-nowrap text-xs text-center">
                  {format(new Date(bid.createdAt), 'HH:mm:ss')}
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BidTable;
