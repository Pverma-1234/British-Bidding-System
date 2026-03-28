import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, PlusCircle, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isBuyer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-[#4F46E5] p-1.5 rounded-sm">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#111827] font-mono text-sm tracking-widest uppercase font-semibold">
              RFQ<span className="text-[#4F46E5]">Auction</span>
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 text-[#6B7280] font-mono text-[10px] tracking-widest uppercase"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>

                {isBuyer && (
                  <Link
                    to="/create"
                    className="flex items-center gap-2 ml-2 px-4 py-2 bg-[#4F46E5] text-white font-mono text-[10px] tracking-widest uppercase font-semibold rounded-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create RFQ
                  </Link>
                )}

                {/* Divider */}
                <div className="h-5 w-px bg-[#E5E7EB] mx-3" />

                {/* User info */}
                <div className="flex flex-col items-end">
                  <span className="text-[#111827] font-mono text-xs font-medium leading-none">{user.name}</span>
                  <span className="text-[#4F46E5] font-mono text-[9px] tracking-widest uppercase mt-1 leading-none">{user.role}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="ml-3 p-2 text-[#6B7280] border border-[#E5E7EB] rounded-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 text-[#6B7280] font-mono text-[10px] tracking-widest uppercase"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white font-mono text-[10px] tracking-widest uppercase font-semibold rounded-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Join Now
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;