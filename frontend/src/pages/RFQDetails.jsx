import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Lock, Activity, ChevronRight, Clock, Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RFQDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
    const [activityLogs, setActivityLogs] = useState([]);

    const [showEndModal, setShowEndModal] = useState(false);
    const [shake, setShake] = useState(false);
  
  const fetchData = async () => {
      try {
        const [res, logsRes] = await Promise.all([
           rfqService.getRFQById(id),
           rfqService.getActivityLogs(id).catch(() => [])
        ]);
        setRfq(res.rfq);
        setBids(res.bids);
        setActivityLogs(logsRes);
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
      socket.on('NEW_BID', fetchData);
      socket.on('rank_update', () => {
        fetchData();
        toast('Auction standings updated!', { icon: '📊' });
      });
      socket.on('TIMER_EXTENDED', ({ newCloseTime }) => {
        setRfq(prev => prev ? { ...prev, endTime: newCloseTime } : prev);
        toast('Auction timeline extended!', { icon: '⏳' });
      });
      socket.on('RFQ_TIMER_UPDATE', ({ endTime }) => {
         setRfq(prev => prev ? { ...prev, endTime } : prev);
      });
      socket.on('RFQ_ENDED_EARLY', ({ endedAt }) => {
        setRfq(prev => prev ? { ...prev, endTime: endedAt, status: 'ENDED', endedEarly: true } : prev);
        toast('Auction ended early by the buyer!', { icon: '🛑' });
      });
      socket.on('RFQ_STATUS_CHANGED', ({ status }) => {
          setRfq(prev => prev ? { ...prev, status } : prev);
      });
      socket.on('RFQ_DELETED', ({ rfqId }) => {
        if (rfqId === id) {
           toast('This auction has been deleted.', { icon: '🗑️' });
           navigate('/');
        }
      });
      return () => {
        socket.off('NEW_BID');
        socket.off('rank_update');
        socket.off('TIMER_EXTENDED');
        socket.off('RFQ_TIMER_UPDATE');
        socket.off('RFQ_ENDED_EARLY');
        socket.off('RFQ_STATUS_CHANGED');
        socket.off('RFQ_DELETED');
        disconnectSocket();
      };
    }, [id]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setBidForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBidSubmit = async (e) => {
      e.preventDefault();

      const now = new Date().getTime();
      const start = new Date(rfq.startTime).getTime();
      if (now < start) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        toast.error("You can only apply when bidding starts");
        return;
      }

      setSubmitting(true);

      const previousBids = [...bids];

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

      const optimisticBids = [...previousBids, optimisticBid]
        .sort((a, b) => a.totalBidValue - b.totalBidValue)
        .map((b, i) => ({ ...b, rank: i + 1 }));

      setBids(optimisticBids);

      try {
        await bidService.placeBid(id, bidForm);
        setBidForm(prev => ({ ...prev, freightCharges: '', originCharges: '', destinationCharges: '', transitTime: '' }));
        toast.success('Quotation submitted successfully!');
      } catch (err) {
        setBids(previousBids);
        toast.error(err.message || 'Error placing bid');
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) return <RFQDetailsSkeleton />;

    const now = new Date().getTime();
    const start = new Date(rfq.startTime).getTime();
    const end = new Date(rfq.endTime).getTime();
    
    const isCreator = user && user.role?.toLowerCase() === 'buyer' && (user.id === rfq.createdBy?._id || user.id === rfq.createdBy);

    let displayStatus = 'LIVE 🟢';
    let statusColor = { bg: 'var(--status-live-bg)', text: 'var(--status-live-text)' };
    
    if (rfq.status === 'AWARDED') {
        displayStatus = 'AWARDED 🏆';
        statusColor = { bg: 'var(--status-awarded-bg)', text: 'var(--status-awarded-text)' };
    } else if (rfq.status === 'ENDED' || rfq.endedEarly || now >= end) {
        displayStatus = 'ENDED 🔴';
        statusColor = { bg: 'var(--status-ended-bg)', text: 'var(--status-ended-text)' };
    } else if (now < start) {
        displayStatus = 'UPCOMING 🟡';
        statusColor = { bg: 'var(--status-upcoming-bg)', text: 'var(--status-upcoming-text)' };
    }

    const isClosed = rfq.status === 'AWARDED' || rfq.status === 'ENDED' || rfq.endedEarly || now >= end;
    const isLive = !isClosed && now >= start;
    const isUpcoming = now < start;

    const endAuctionEarly = async () => {
      try {
        const res = await rfqService.endRFQEarly(id);
        setRfq(prev => ({ ...prev, endTime: res.rfq.endTime, status: 'ENDED', endedEarly: true }));
        setShowEndModal(false);
        toast.success('Auction ended explicitly.');
      } catch (err) {
        toast.error('Failed to end auction early');
      }
    };

    const handleDelete = async () => {
      console.log("User Role:", user?.role);
      console.log("User ID:", user?._id || user?.id);
      console.log("RFQ Owner:", rfq?.createdBy?._id || rfq?.createdBy);

      if (!window.confirm("Are you sure you want to delete this RFQ?")) return;
      try {
        await rfqService.deleteRFQ(id);
        toast.success('RFQ deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error(err.message || 'Error deleting RFQ');
      }
    };

    const l1Bid = bids.find(b => b.rank === 1);
    const refId = id.slice(-8).toUpperCase();

    const inputStyle = {
      width: '100%',
      backgroundColor: "var(--bg-primary)",
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      color: "var(--text-primary)",
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
      color: "var(--text-secondary)",
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: '6px',
    };

    const rules = [
      { label: 'Issued By', value: rfq.createdBy?.name || 'N/A' },
      { label: 'Service Date', value: rfq.serviceDate ? format(new Date(rfq.serviceDate), 'MMM dd, yyyy') : 'N/A' },
      { label: 'Pickup Location', value: rfq.pickupLocation },
      { label: 'Drop Location', value: rfq.dropLocation },
      { label: 'Extension Trigger', value: rfq.extensionTriggerType },
      { label: 'Trigger Window', value: `${rfq.triggerWindow} min` },
      { label: 'Extension Duration', value: `+${rfq.extensionDuration} min` },
      { label: 'Hard Deadline', value: formatDateTime(rfq.maxEndTime), accent: true },
    ];

    return (
      <>
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: '100vh', color: "var(--text-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div style={{ color: "var(--text-secondary)" }} className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-10">
            <span>Auctions</span>
            <ChevronRight className="w-3 h-3" />
            <span>RFQs</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "var(--text-primary)" }}>{refId}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            <div className="lg:col-span-2 space-y-8">

              <div style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-color)" }} className="sticky top-14 z-40 pt-4 pb-6 -mt-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-3 h-3" style={{ color: '#4F46E5' }} />
                  <span style={{ color: '#4F46E5' }} className="font-semibold text-[10px] tracking-widest uppercase">
                    Request for Quotation
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 style={{ color: "var(--text-primary)" }} className="text-3xl font-extrabold tracking-tight">
                        {rfq.name}
                      </h1>
                      <span
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        className="badge font-bold uppercase tracking-wider shadow-sm"
                      >
                        <span className="badge-text">{displayStatus}</span>
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)" }} className="text-sm border-l-2 pl-3 py-1">
                      ID: <span className="font-mono text-xs">{rfq._id}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCreator && rfq.status !== 'AWARDED' && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                    {isCreator && isLive && (
                      <button
                        onClick={() => setShowEndModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                      >
                        End Auction Now
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pb-2">
                  <div className="flex items-center gap-3">
                    <span
                      style={{ color: "var(--text-secondary)", border: '1px solid var(--border-color)', backgroundColor: "var(--bg-secondary)" }}
                      className="font-mono text-[10px] tracking-widest uppercase rounded px-2.5 py-1"
                    >
                      REF #{refId}
                    </span>
                    <div style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }} className="flex items-center justify-center w-8 h-8 rounded-full shadow-sm shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p style={{ color: '#1E3A8A' }} className="text-xs font-bold uppercase tracking-wider mb-0.5">Ends on</p>
                      <span style={{ color: "var(--text-secondary)" }} className="font-mono text-[10px] tracking-widest uppercase">{formatDateTime(rfq.endTime)}</span>
                    </div>
                  </div>
                  <CountdownTimer rfq={rfq} />
                </div>

                <div className="mt-4">
                  {l1Bid ? (
                    <div
                      style={{ border: '1px solid var(--border-color)', backgroundColor: "var(--bg-secondary)", borderRadius: '12px' }}
                      className="p-6 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div style={{ color: "var(--text-secondary)" }} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase mb-3">
                          <TrendingDown className="w-3 h-3" style={{ color: '#10B981' }} />
                          Current L1 — Lowest Quote
                        </div>
                        <p style={{ color: '#10B981' }} className="text-4xl font-semibold tracking-tight">
                          ${l1Bid.totalBidValue?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ color: "var(--text-secondary)" }} className="text-[10px] font-semibold tracking-widest uppercase mb-1.5">Held by</p>
                        <p style={{ color: "var(--text-primary)" }} className="font-medium">{l1Bid.bidder?.name || 'Undisclosed'}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ border: '2px dashed var(--border-color)', backgroundColor: "var(--bg-secondary)", borderRadius: '12px' }}
                      className="p-6 text-center"
                    >
                      <p style={{ color: "var(--text-secondary)" }} className="text-[10px] font-semibold tracking-widest uppercase">
                        No Bids Recorded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bid History */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <History className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  <span style={{ color: "var(--text-secondary)" }} className="text-[10px] font-semibold tracking-widest uppercase">
                    Bid History & Rankings
                  </span>
                  <div style={{ backgroundColor: "var(--border-color)" }} className="flex-1 h-px" />
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                  <BidTable bids={bids} isCreator={isCreator} isClosed={isClosed} rfq={rfq} setRfq={setRfq} />
                </div>
              </div>

              <div className="text-right pt-6">
                <p style={{ color: "var(--text-secondary)" }} className="text-[11px] font-semibold tracking-wide uppercase">
                  RFQ Initiated by <span style={{ color: "var(--text-primary)" }}>{rfq.createdBy?.name || 'Unknown Buyer'}</span>
                </p>
              </div>

            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-6 lg:sticky lg:top-8">

              {/* Bid Form */}
              <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>

                <div style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: "var(--bg-primary)" }} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Gavel className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                    <span className="font-semibold text-[10px] tracking-widest uppercase">
                      {isBidder ? 'Submit Quotation' : 'Auction Access'}
                    </span>
                  </div>
                  {isBidder && !isClosed && (
                    <span style={{ color: "var(--text-secondary)" }} className="text-[9px] font-semibold tracking-widest uppercase">
                      Binding
                    </span>
                  )}
                </div>

                <div className="p-5">

                  {!isBidder ? (
                    <div className="text-center py-8 space-y-4">
                      <div
                        style={{ border: '1px solid var(--border-color)', backgroundColor: "var(--bg-primary)" }}
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                      >
                        <Lock className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p style={{ color: "var(--text-primary)" }} className="font-medium mb-2">Observer Access</p>
                        <p style={{ color: "var(--text-secondary)" }} className="text-[10px] font-semibold tracking-wide uppercase leading-loose">
                          Signed in as <span style={{ color: '#4F46E5' }}>{user.role}</span>.<br />
                          Bidder accounts only.
                        </p>
                      </div>
                    </div>

                  ) : isClosed ? (
                    <div style={{ border: '1px solid var(--border-color)', backgroundColor: "var(--bg-primary)", borderRadius: '8px' }} className="p-5 text-center">
                      <p style={{ color: '#EF4444' }} className="font-semibold text-[10px] tracking-widest uppercase mb-1">
                        Auction Closed
                      </p>
                      <p style={{ color: "var(--text-secondary)" }} className="text-sm">No further submissions accepted.</p>
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
                          disabled={isUpcoming}
                          onFocus={e => e.target.style.borderColor = '#4F46E5'}
                          onBlur={e => e.target.style.borderColor = "var(--border-color)"}
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
                            disabled={isUpcoming}
                            onFocus={e => e.target.style.borderColor = '#4F46E5'}
                            onBlur={e => e.target.style.borderColor = "var(--border-color)"}
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
                            disabled={isUpcoming}
                            onFocus={e => e.target.style.borderColor = '#4F46E5'}
                            onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                          />
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)' }} className="my-1" />

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
                            disabled={isUpcoming}
                            onFocus={e => e.target.style.borderColor = '#4F46E5'}
                            onBlur={e => e.target.style.borderColor = "var(--border-color)"}
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
                            disabled={isUpcoming}
                            onFocus={e => e.target.style.borderColor = '#4F46E5'}
                            onBlur={e => e.target.style.borderColor = "var(--border-color)"}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        onClick={(e) => {
                          if (isUpcoming) {
                             e.preventDefault();
                             setShake(true);
                             setTimeout(() => setShake(false), 400);
                             toast.error("You can only apply when bidding starts");
                          }
                        }}
                        style={{ backgroundColor: isUpcoming ? '#EEF2FF' : '#4F46E5', color: isUpcoming ? '#4F46E5' : 'white' }}
                        className={`w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all ${shake ? 'translate-x-1 border-red-500' : ''} ${isUpcoming ? 'opacity-50 cursor-not-allowed border border-[#4F46E5]' : 'hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed'}`}
                      >
                        {isUpcoming 
                          ? <><Clock className="w-3.5 h-3.5" /> Starts Soon</>
                          : submitting
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</>
                            : <><Send className="w-3.5 h-3.5" /> Submit Quotation</>
                        }
                      </button>

                    </form>
                  )}
                </div>
              </div>

              {/* Auction Parameters */}
              <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: "var(--bg-primary)" }} className="px-5 py-4">
                  <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Settings className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                    <span className="font-semibold text-[10px] tracking-widest uppercase">Auction Parameters</span>
                  </div>
                </div>

                <div className="px-5 py-2">
                  {rules.map(({ label, value, accent }, i) => (
                    <div
                      key={label}
                      style={{ borderBottom: i < rules.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                      className="flex items-center justify-between py-3"
                    >
                      <span style={{ color: "var(--text-secondary)" }} className="text-[10px] font-semibold tracking-widest uppercase">{label}</span>
                      <span style={{ color: accent ? '#F59E0B' : "var(--text-primary)" }} className="font-mono text-xs font-semibold">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: "var(--bg-primary)" }} className="px-5 py-4">
                  <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Activity className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
                    <span className="font-semibold text-[10px] tracking-widest uppercase">Live Activity Log</span>
                  </div>
                </div>
                <div className="p-5 max-h-[300px] overflow-y-auto space-y-4">
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center italic">No activity yet.</p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log._id} className="flex gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#4F46E5]" />
                        <div>
                          <p className="font-medium text-[13px] text-gray-900 leading-tight">{log.message}</p>
                          <p className="text-[10px] font-mono text-gray-500 mt-1">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">End Auction Early?</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to end this auction early? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={endAuctionEarly}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                Confirm End
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RFQDetails;