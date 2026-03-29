import React from 'react';
import RankBadge from './RankBadge';
import { format } from 'date-fns';
import { rfqService } from '../services/api';
import toast from 'react-hot-toast';

const BidTable = ({ bids, isCreator, isClosed, rfq, setRfq }) => {
  const [awardingId, setAwardingId] = React.useState(null);

  const handleAward = async (bidderId) => {
    try {
      setAwardingId(bidderId);
      await rfqService.awardBid(rfq._id, bidderId);
      setRfq(prev => ({ ...prev, status: 'AWARDED', selectedBidderId: bidderId }));
      toast.success('Contract Awarded Successfully! 🏆');
    } catch (err) {
      toast.error(err.message || 'Failed to award contract');
    } finally {
      setAwardingId(null);
    }
  };

  if (!bids || bids.length === 0) {
    return (
      <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }} className="rounded-xl p-12 text-center">
        <p style={{ color: "var(--text-secondary)" }}>No bids placed yet.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }} className="overflow-hidden rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }}>
            <tr>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Supplier</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Freight</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Origin</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Dest.</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Total</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Valid Until</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Transit</th>
              <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Bid Time</th>
              {(isCreator && (isClosed || rfq?.status === 'AWARDED')) && (
                 <th style={{ color: "var(--text-secondary)" }} className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, idx) => {
              const isL1 = bid.rank === 1;
              return (
                <tr
                  key={bid._id}
                  style={{
                    backgroundColor: isL1 ? 'var(--l1-bg)' : "var(--bg-secondary)",
                    borderLeft: isL1 ? '4px solid var(--l1-border-left)' : '4px solid transparent',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                  className={`transition-all duration-300 ${isL1 ? 'shadow-sm' : 'hover:brightness-95 dark:hover:brightness-110'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isL1 ? (
                      <div style={{ backgroundColor: 'var(--l1-badge-bg)', color: 'var(--l1-badge-text)', borderColor: 'var(--l1-badge-border)' }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold border shadow-sm animate-pulse">
                        <span>L1 🏆</span>
                      </div>
                    ) : (
                      <RankBadge rank={bid.rank} />
                    )}
                  </td>
                <td style={{ color: "var(--text-primary)" }} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {bid.bidder?.name || 'Unknown'}
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.freightCharges.toLocaleString()}
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.originCharges.toLocaleString()}
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${bid.destinationCharges.toLocaleString()}
                </td>
                <td style={{ color: "var(--text-primary)" }} className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                  ${bid.totalBidValue.toLocaleString()}
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-xs text-center">
                  {bid.quoteValidity ? format(new Date(bid.quoteValidity), 'MMM dd, yyyy') : 'N/A'}
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {bid.transitTime} days
                </td>
                <td style={{ color: "var(--text-secondary)" }} className="px-6 py-4 whitespace-nowrap text-xs text-center">
                  {format(new Date(bid.createdAt), 'HH:mm:ss')}
                </td>
                {(isCreator && (isClosed || rfq?.status === 'AWARDED')) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                     {rfq?.selectedBidderId === bid.bidder?._id || rfq?.selectedBidderId === bid.bidder ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-[#FEF08A] text-[#854D0E] shadow-sm">
                           Winner 🏆
                        </span>
                     ) : rfq?.status === 'AWARDED' ? (
                        <span style={{ color: '#9CA3AF' }} className="text-xs italic">Not Selected</span>
                     ) : (
                        <button
                          onClick={() => handleAward(bid.bidder?._id || bid.bidder)}
                          disabled={awardingId === (bid.bidder?._id || bid.bidder)}
                          className="px-4 py-2 bg-[#111827] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50"
                        >
                          {awardingId === (bid.bidder?._id || bid.bidder) ? '...' : 'Award Contract'}
                        </button>
                     )}
                  </td>
                )}
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
