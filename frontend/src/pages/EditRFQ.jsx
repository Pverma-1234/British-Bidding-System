import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rfqService } from '../services/api';
import { Save, ArrowLeft, Clock, Zap, ShieldAlert, PackagePlus, CalendarCheck } from 'lucide-react';
import { addMinutes, format } from 'date-fns';
import toast from 'react-hot-toast';

const EditRFQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    maxEndTime: '',
    triggerWindow: 5,
    extensionDuration: 2,
    extensionTriggerType: 'ANY_BID',
    pickupLocation: '',
    dropLocation: '',
    serviceDate: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const res = await rfqService.getRFQById(id);
        const { rfq } = res;
        
        if (new Date() >= new Date(rfq.startTime)) {
            toast.error("Cannot edit RFQ after it has started");
            navigate('/');
            return;
        }

        setFormData({
            name: rfq.name,
            startTime: format(new Date(rfq.startTime), "yyyy-MM-dd'T'HH:mm"),
            endTime: format(new Date(rfq.endTime), "yyyy-MM-dd'T'HH:mm"),
            maxEndTime: format(new Date(rfq.maxEndTime), "yyyy-MM-dd'T'HH:mm"),
            triggerWindow: rfq.triggerWindow,
            extensionDuration: rfq.extensionDuration,
            extensionTriggerType: rfq.extensionTriggerType,
            pickupLocation: rfq.pickupLocation || '',
            dropLocation: rfq.dropLocation || '',
            serviceDate: rfq.serviceDate ? format(new Date(rfq.serviceDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        });
      } catch (err) {
        toast.error('Failed to load RFQ');
        navigate('/');
      } finally {
        setFetching(false);
      }
    };
    fetchRFQ();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(formData.startTime);
    const bidClose = new Date(formData.endTime);
    const forcedClose = new Date(formData.maxEndTime);

    if (start >= bidClose) {
      setError("End Time must be after Start Time.");
      return;
    }
    
    if (start >= forcedClose) {
      setError("Max End Time must be after Start Time.");
      return;
    }

    if (bidClose > forcedClose) {
      setError("Max End Time must be at or after End Time.");
      return;
    }

    if (formData.triggerWindow > 0 && formData.extensionDuration > 0) {
      const minForcedClose = new Date(bidClose.getTime() + formData.extensionDuration * 60000);
      if (minForcedClose > forcedClose) {
        setError("Max End Time must allow at least one full extension duration after End Time.");
        return;
      }
    }

    setLoading(true);
    try {
      await rfqService.updateRFQ(id, formData);
      toast.success('RFQ updated successfully');
      navigate(`/rfq/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error updating RFQ');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--bg-primary)",
    border: '1px solid #E5E7EB',
    color: "var(--text-primary)",
    outline: 'none',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate('/')}
        style={{ color: "var(--text-secondary)" }}
        className="flex items-center gap-2 hover:text-[#4F46E5] transition-colors mb-6 group font-medium"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div style={{ backgroundColor: "var(--bg-secondary)", border: '1px solid #E5E7EB' }} className="rounded-2xl shadow-xl overflow-hidden">
        <div style={{ backgroundColor: "var(--bg-primary)", borderBottom: '1px solid #E5E7EB' }} className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#4F46E5' }} className="p-2.5 rounded-xl">
              <PackagePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ color: "var(--text-primary)" }} className="text-2xl font-bold">Edit RFQ</h1>
              <p style={{ color: "var(--text-secondary)" }} className="text-sm">Update auction rules and extension logic before it starts.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-8">
            <div className="col-span-full">
              <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                RFQ Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Electronics Shipment - Q2 2026"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Clock className="w-4 h-4" style={{ color: '#4F46E5' }} /> Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
              <div>
                <label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} /> End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
              <div>
                <label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <ShieldAlert className="w-4 h-4" style={{ color: '#EF4444' }} /> Max End Time
                </label>
                <input
                  type="datetime-local"
                  name="maxEndTime"
                  required
                  value={formData.maxEndTime}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  required
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g., 123 Warehouse St, City"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
              <div>
                <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                  Drop Location
                </label>
                <input
                  type="text"
                  name="dropLocation"
                  required
                  value={formData.dropLocation}
                  onChange={handleChange}
                  placeholder="e.g., 456 Delivery Ave, City"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label style={{ color: "var(--text-primary)" }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <CalendarCheck className="w-4 h-4" style={{ color: '#10B981' }} /> Service Date (Pickup Date)
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  required
                  value={formData.serviceDate}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#10B981] transition-all"
                />
              </div>
            </div>

            <div
              style={{ borderTop: '1px solid #E5E7EB' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6"
            >
              <div className="space-y-6">
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                    Trigger Window (Minutes)
                  </label>
                  <p style={{ color: "var(--text-secondary)" }} className="text-xs mb-2">How many minutes before close should a bid trigger an extension?</p>
                  <input
                    type="number"
                    name="triggerWindow"
                    required
                    min="1"
                    value={formData.triggerWindow}
                    onChange={handleChange}
                    style={inputStyle}
                    className="w-32 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                  />
                </div>
                <div>
                  <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                    Extension Duration (Minutes)
                  </label>
                  <p style={{ color: "var(--text-secondary)" }} className="text-xs mb-2">How many minutes to add to the clock when triggered?</p>
                  <input
                    type="number"
                    name="extensionDuration"
                    required
                    min="1"
                    value={formData.extensionDuration}
                    onChange={handleChange}
                    style={inputStyle}
                    className="w-32 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: "var(--text-primary)" }} className="block text-sm font-semibold mb-2">
                  Extension Trigger Type
                </label>
                <p style={{ color: "var(--text-secondary)" }} className="text-xs mb-4">Select condition that triggers time extension.</p>
                <div className="space-y-3">
                  {['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'].map((type) => (
                    <label
                      key={type}
                      style={{
                        border: formData.extensionTriggerType === type ? '1px solid #4F46E5' : '1px solid #E5E7EB',
                        backgroundColor: formData.extensionTriggerType === type ? '#EEF2FF' : "var(--bg-secondary)",
                      }}
                      className="flex items-center p-3 rounded-xl cursor-pointer transition-all hover:border-[#4F46E5]"
                    >
                      <input
                        type="radio"
                        name="extensionTriggerType"
                        value={type}
                        checked={formData.extensionTriggerType === type}
                        onChange={handleChange}
                        className="w-4 h-4"
                        style={{ accentColor: '#4F46E5' }}
                      />
                      <span style={{ color: "var(--text-primary)" }} className="ml-3 text-sm font-medium">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#4F46E5' }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-white hover:bg-[#4338CA] font-bold disabled:opacity-50 transition-all active:scale-95 shadow-sm"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRFQ;
