import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutModal from './LogoutModal';

const Header = ({ onMenuClick }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-white  sticky top-0 z-30">
      <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search clients, requests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-500 rounded-full outline-none transition-all duration-200 focus:shadow-lg
           focus:border-gray-900
           hover:shadow"
            // style={{
            //   '--tw-ring-color': 'var(--primary-color)',
            //   borderColor: 'var(--primary-color)'
            // }}
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
};

export default Header;
