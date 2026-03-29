import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: '1px solid #E5E7EB',
        }}
        className="max-w-md w-full rounded-3xl shadow-xl overflow-hidden p-8"
      >
        <div className="text-center mb-10">
          <div style={{ backgroundColor: '#4F46E5' }} className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-2xl font-black">Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)" }} className="mt-2">Login to manage your RFQs and bids.</p>
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
          <div className="space-y-2">
            <label style={{ color: "var(--text-secondary)" }} className="text-xs font-bold uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: '1px solid #E5E7EB',
                  color: "var(--text-primary)",
                  outline: 'none',
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label style={{ color: "var(--text-secondary)" }} className="text-xs font-bold uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: '1px solid #E5E7EB',
                  color: "var(--text-primary)",
                  outline: 'none',
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#4F46E5] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#4F46E5' }}
            className="w-full flex items-center justify-center gap-2 py-4 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 disabled:opacity-75 hover:bg-[#4338CA] shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#4F46E5' }} className="font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
