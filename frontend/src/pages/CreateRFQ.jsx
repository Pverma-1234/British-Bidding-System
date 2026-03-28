import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfqService } from '../services/api';
import { Save, ArrowLeft, Clock, Zap, ShieldAlert, PackagePlus } from 'lucide-react';
import { addMinutes, format } from 'date-fns';

const CreateRFQ = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    bidCloseTime: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
    forcedCloseTime: format(addMinutes(new Date(), 60), "yyyy-MM-dd'T'HH:mm"),
    triggerWindow: 5,
    extensionDuration: 2,
    extensionTriggerType: 'ANY_BID',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rfqService.createRFQ(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error creating RFQ');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    color: '#111827',
    outline: 'none',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate('/')}
        style={{ color: '#6B7280' }}
        className="flex items-center gap-2 hover:text-[#4F46E5] transition-colors mb-6 group font-medium"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} className="rounded-2xl shadow-xl overflow-hidden">
        <div style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }} className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: '#4F46E5' }} className="p-2.5 rounded-xl">
              <PackagePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ color: '#111827' }} className="text-2xl font-bold">Create New RFQ</h1>
              <p style={{ color: '#6B7280' }} className="text-sm">Configure auction rules and extension logic.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-8">
            <div className="col-span-full">
              <label style={{ color: '#111827' }} className="block text-sm font-semibold mb-2">
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
                <label style={{ color: '#111827' }} className="flex items-center gap-2 text-sm font-semibold mb-2">
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
                <label style={{ color: '#111827' }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} /> Bid Close Time
                </label>
                <input
                  type="datetime-local"
                  name="bidCloseTime"
                  required
                  value={formData.bidCloseTime}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
              <div>
                <label style={{ color: '#111827' }} className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <ShieldAlert className="w-4 h-4" style={{ color: '#EF4444' }} /> Forced Close Time
                </label>
                <input
                  type="datetime-local"
                  name="forcedCloseTime"
                  required
                  value={formData.forcedCloseTime}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                />
              </div>
            </div>

            <div
              style={{ borderTop: '1px solid #E5E7EB' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6"
            >
              <div className="space-y-6">
                <div>
                  <label style={{ color: '#111827' }} className="block text-sm font-semibold mb-2">
                    Trigger Window (Minutes)
                  </label>
                  <p style={{ color: '#6B7280' }} className="text-xs mb-2">How many minutes before close should a bid trigger an extension?</p>
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
                  <label style={{ color: '#111827' }} className="block text-sm font-semibold mb-2">
                    Extension Duration (Minutes)
                  </label>
                  <p style={{ color: '#6B7280' }} className="text-xs mb-2">How many minutes to add to the clock when triggered?</p>
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
                <label style={{ color: '#111827' }} className="block text-sm font-semibold mb-2">
                  Extension Trigger Type
                </label>
                <p style={{ color: '#6B7280' }} className="text-xs mb-4">Select condition that triggers time extension.</p>
                <div className="space-y-3">
                  {['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'].map((type) => (
                    <label
                      key={type}
                      style={{
                        border: formData.extensionTriggerType === type ? '1px solid #4F46E5' : '1px solid #E5E7EB',
                        backgroundColor: formData.extensionTriggerType === type ? '#EEF2FF' : '#FFFFFF',
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
                      <span style={{ color: '#111827' }} className="ml-3 text-sm font-medium">{type.replace('_', ' ')}</span>
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
              {loading ? 'Creating...' : 'Launch Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQ;
