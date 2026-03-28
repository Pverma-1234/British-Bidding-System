import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { rfqService, bidService } from '../services/api';
import socket, { connectSocket, joinRFQ, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import BidTable from '../components/BidTable';
import CountdownTimer from '../components/CountdownTimer';
import toast from 'react-hot-toast';
import { RFQDetailsSkeleton } from '../components/Skeletons';
import {
  Gavel, Send, History, Settings, TrendingDown,
  DollarSign, Truck, CalendarCheck, Loader2,
  Lock, Activity, ChevronRight
} from 'lucide-react';

const RFQDetails = () => {
  const { id } = useParams();
  const { user, isBidder } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({
    freightCharges: '',
    originCharges: '',
    destinationCharges: '',
    transitTime: '',
    quoteValidity: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const res = await rfqService.getRFQById(id);
      setRfq(res.rfq);
      setBids(res.bids);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    connectSocket();
    joinRFQ(id);
    socket.on('new_bid', fetchData);
    socket.on('rank_update', () => {
      fetchData();
      toast('Auction standings updated!', { icon: '📊' });
    });
    socket.on('auction_extended', () => {
      fetchData();
      toast('Auction timeline extended!', { icon: '⏳' });
    });
    return () => {
      socket.off('new_bid');
      socket.off('rank_update');
      socket.off('auction_extended');
      disconnectSocket();
    };
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBidForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 1. Snapshot previous state for rollback
    const previousBids = [...bids];
    
    // 2. Construct optimistic bid
    const freight = parseFloat(bidForm.freightCharges) || 0;
    const origin = parseFloat(bidForm.originCharges) || 0;
    const dest = parseFloat(bidForm.destinationCharges) || 0;
    const totalBidValue = freight + origin + dest;

    const optimisticBid = {
      _id: `temp-${Date.now()}`,
      bidder: { name: user.name, _id: user.id },
      totalBidValue,
      ...bidForm,
      createdAt: new Date().toISOString(),
    };

    // 3. Optimistically update and rank
    const optimisticBids = [...previousBids, optimisticBid]
      .sort((a, b) => a.totalBidValue - b.totalBidValue)
      .map((b, i) => ({ ...b, rank: i + 1 }));

    setBids(optimisticBids);

    try {
      await bidService.placeBid(id, bidForm);
      setBidForm(prev => ({ ...prev, freightCharges: '', originCharges: '', destinationCharges: '', transitTime: '' }));
      toast.success('Quotation submitted successfully!');
    } catch (err) {
      setBids(previousBids); // Rollback on error
      toast.error(err.message || 'Error placing bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <RFQDetailsSkeleton />;

  const isClosed = new Date() > new Date(rfq.bidCloseTime);
  const l1Bid = bids.find(b => b.rank === 1);
  const refId = id.slice(-8).toUpperCase();

  const inputStyle = {
    width: '100%',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    color: '#111827',
    fontSize: '14px',
    padding: '10px 14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6B7280',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  const rules = [
    { label: 'Issued By',          value: rfq.createdBy?.name || 'N/A'   },
    { label: 'Extension Trigger',  value: rfq.extensionTriggerType        },
    { label: 'Trigger Window',     value: `${rfq.triggerWindow} min`      },
    { label: 'Extension Duration', value: `+${rfq.extensionDuration} min` },
    { label: 'Hard Deadline',      value: new Date(rfq.forcedCloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), accent: true },
  ];

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', color: '#111827' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <div style={{ color: '#6B7280' }} className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-10">
          <span>Auctions</span>
          <ChevronRight className="w-3 h-3" />
          <span>RFQs</span>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: '#111827' }}>{refId}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <div className="sticky top-14 z-40 bg-[#F9FAFB] pt-4 pb-6 -mt-4 border-b border-[#E5E7EB] mb-6">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-3 h-3" style={{ color: '#4F46E5' }} />
                <span style={{ color: '#4F46E5' }} className="font-semibold text-[10px] tracking-widest uppercase">
                  Request for Quotation
                </span>
              </div>

              <h1 style={{ color: '#111827' }} className="text-3xl font-semibold tracking-tight leading-snug mb-6">
                {rfq.name}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <span
                    style={{ color: '#6B7280', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
                    className="font-mono text-[10px] tracking-widest uppercase rounded px-2.5 py-1"
                  >
                    REF #{refId}
                  </span>
                  <div
                    style={{ border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}
                    className="flex items-center gap-2 rounded px-2.5 py-1"
                  >
                    <span
                      style={{ backgroundColor: '#10B981' }}
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                    />
                    <span style={{ color: '#6B7280' }} className="font-mono text-[10px] tracking-widest uppercase">Live</span>
                  </div>
                </div>
                <CountdownTimer targetDate={rfq.bidCloseTime} />
              </div>

              {/* L1 Banner */}
              <div className="mt-4">
                {l1Bid ? (
                  <div
                    style={{ border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', borderRadius: '12px' }}
                    className="p-6 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div style={{ color: '#6B7280' }} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase mb-3">
                        <TrendingDown className="w-3 h-3" style={{ color: '#10B981' }} />
                        Current L1 — Lowest Quote
                      </div>
                      <p style={{ color: '#10B981' }} className="text-4xl font-semibold tracking-tight">
                        ${l1Bid.totalBidValue?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: '#6B7280' }} className="text-[10px] font-semibold tracking-widest uppercase mb-1.5">Held by</p>
                      <p style={{ color: '#111827' }} className="font-medium">{l1Bid.bidder?.name || 'Undisclosed'}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ border: '2px dashed #E5E7EB', backgroundColor: '#FFFFFF', borderRadius: '12px' }}
                    className="p-6 text-center"
                  >
                    <p style={{ color: '#6B7280' }} className="text-[10px] font-semibold tracking-widest uppercase">
                      No Bids Recorded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid History */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <History className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                <span style={{ color: '#6B7280' }} className="text-[10px] font-semibold tracking-widest uppercase">
                  Bid History & Rankings
                </span>
                <div style={{ backgroundColor: '#E5E7EB' }} className="flex-1 h-px" />
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <BidTable bids={bids} />
              </div>
            </div>

          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-6 lg:sticky lg:top-8">

            {/* Bid Form */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>

              <div style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ color: '#111827' }}>
                  <Gavel className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                  <span className="font-semibold text-[10px] tracking-widest uppercase">
                    {isBidder ? 'Submit Quotation' : 'Auction Access'}
                  </span>
                </div>
                {isBidder && !isClosed && (
                  <span style={{ color: '#6B7280' }} className="text-[9px] font-semibold tracking-widest uppercase">
                    Binding
                  </span>
                )}
              </div>

              <div className="p-5">

                {!isBidder ? (
                  <div className="text-center py-8 space-y-4">
                    <div
                      style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Lock className="w-4 h-4" style={{ color: '#6B7280' }} />
                    </div>
                    <div>
                      <p style={{ color: '#111827' }} className="font-medium mb-2">Observer Access</p>
                      <p style={{ color: '#6B7280' }} className="text-[10px] font-semibold tracking-wide uppercase leading-loose">
                        Signed in as <span style={{ color: '#4F46E5' }}>{user.role}</span>.<br />
                        Bidder accounts only.
                      </p>
                    </div>
                  </div>

                ) : isClosed ? (
                  <div style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', borderRadius: '8px' }} className="p-5 text-center">
                    <p style={{ color: '#EF4444' }} className="font-semibold text-[10px] tracking-widest uppercase mb-1">
                      Auction Closed
                    </p>
                    <p style={{ color: '#6B7280' }} className="text-sm">No further submissions accepted.</p>
                  </div>

                ) : (
                  <form onSubmit={handleBidSubmit} className="space-y-4">

                    <div>
                      <label style={labelStyle}>
                        <DollarSign className="w-2.5 h-2.5" /> Freight Charges
                      </label>
                      <input
                        style={inputStyle}
                        type="number"
                        name="freightCharges"
                        required
                        value={bidForm.freightCharges}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        onFocus={e => e.target.style.borderColor = '#4F46E5'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Origin</label>
                        <input
                          style={inputStyle}
                          type="number"
                          name="originCharges"
                          required
                          value={bidForm.originCharges}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Destination</label>
                        <input
                          style={inputStyle}
                          type="number"
                          name="destinationCharges"
                          required
                          value={bidForm.destinationCharges}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB' }} className="my-1" />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>
                          <Truck className="w-2.5 h-2.5" /> Transit Days
                        </label>
                        <input
                          style={inputStyle}
                          type="number"
                          name="transitTime"
                          required
                          value={bidForm.transitTime}
                          onChange={handleInputChange}
                          placeholder="—"
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          <CalendarCheck className="w-2.5 h-2.5" /> Valid Until
                        </label>
                        <input
                          style={inputStyle}
                          type="date"
                          name="quoteValidity"
                          required
                          value={bidForm.quoteValidity}
                          onChange={handleInputChange}
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ backgroundColor: '#4F46E5' }}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-semibold tracking-widest uppercase hover:bg-[#4338CA] transition-colors"
                    >
                      {submitting
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</>
                        : <><Send className="w-3.5 h-3.5" /> Submit Quotation</>
                      }
                    </button>

                  </form>
                )}
              </div>
            </div>

            {/* Auction Parameters */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }} className="px-5 py-4">
                <div className="flex items-center gap-2" style={{ color: '#111827' }}>
                  <Settings className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                  <span className="font-semibold text-[10px] tracking-widest uppercase">Auction Parameters</span>
                </div>
              </div>

              <div className="px-5 py-2">
                {rules.map(({ label, value, accent }, i) => (
                  <div
                    key={label}
                    style={{ borderBottom: i < rules.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    className="flex items-center justify-between py-3"
                  >
                    <span style={{ color: '#6B7280' }} className="text-[10px] font-semibold tracking-widest uppercase">{label}</span>
                    <span style={{ color: accent ? '#F59E0B' : '#111827' }} className="font-mono text-xs font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RFQDetails;