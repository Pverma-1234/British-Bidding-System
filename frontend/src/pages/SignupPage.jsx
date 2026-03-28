import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BIDDER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(formData.name, formData.email, formData.password, formData.role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F9FAFB' }}>
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
        className="max-w-xl w-full rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <div style={{ backgroundColor: '#4F46E5' }} className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 style={{ color: '#111827' }} className="text-2xl font-black uppercase tracking-wider">Join RFQ Auction</h1>
          <p style={{ color: '#6B7280' }} className="mt-2">Create an account to start bidding or posting RFQs.</p>
        </div>

        {error && (
          <div
            style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#EF4444' }}
            className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label style={{ color: '#6B7280' }} className="text-xs font-bold uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label style={{ color: '#6B7280' }} className="text-xs font-bold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label style={{ color: '#6B7280' }} className="text-xs font-bold uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label style={{ color: '#6B7280' }} className="text-xs font-bold uppercase tracking-wider ml-1">Choose Your Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                style={{
                  border: formData.role === 'BIDDER' ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                  backgroundColor: formData.role === 'BIDDER' ? '#EEF2FF' : '#FFFFFF',
                }}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="role"
                  value="BIDDER"
                  checked={formData.role === 'BIDDER'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: '#4F46E5' }}
                />
                <div className="flex flex-col">
                  <span style={{ color: '#111827' }} className="text-sm font-black uppercase tracking-wide">Bidder</span>
                  <span style={{ color: '#6B7280' }} className="text-xs uppercase tracking-tighter">Place bids on RFQs</span>
                </div>
              </label>

              <label
                style={{
                  border: formData.role === 'BUYER' ? '2px solid #4F46E5' : '2px solid #E5E7EB',
                  backgroundColor: formData.role === 'BUYER' ? '#EEF2FF' : '#FFFFFF',
                }}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="role"
                  value="BUYER"
                  checked={formData.role === 'BUYER'}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: '#4F46E5' }}
                />
                <div className="flex flex-col">
                  <span style={{ color: '#111827' }} className="text-sm font-black uppercase tracking-wide">Buyer</span>
                  <span style={{ color: '#6B7280' }} className="text-xs uppercase tracking-tighter">Create & Manage RFQs</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#4F46E5' }}
            className="w-full flex items-center justify-center gap-2 py-4 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 disabled:opacity-75 hover:bg-[#4338CA] shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium" style={{ color: '#6B7280' }}>
          Already a member?{' '}
          <Link to="/login" style={{ color: '#4F46E5' }} className="font-black hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
