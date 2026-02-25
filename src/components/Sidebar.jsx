import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isSuperAdmin } = useAuth();

  const menuItems = isSuperAdmin ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/requests', label: 'Requests', icon: '📋' },
    { path: '/previous-clients', label: 'Previous Clients', icon: '📂' },
    { path: '/add-client', label: 'Add Client', icon: '➕' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ] : [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: `/clients/${user?.id}`, label: 'My Content', icon: '📝' },
    { path: '/requests', label: 'Requests', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className={`p-2 border-slate-200 `}>
            <div className="flex items-center gap-3 ml-10">
              {/* <div className="w-10 h-10 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div> */}
              <img
                src={user?.logo && user.logo !== "default-logo.png" ? user.logo : "/brandwar-01.png"}
                alt="Logo"
                className="h-20 w-auto"
              />
              {/* <h2 className="text-black font-bold text-lg">Brandwar</h2> */}
              {/* <p className="text-black/80 text-xs">{isSuperAdmin ? 'Super Admin' : 'Admin'} Panel</p> */}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'sidebar-item-active group' : 'sidebar-item-inactive hover:translate-x-1'}`
                }
              >
                <span className="text-lg transition-transform group-hover:scale-110">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: 'var(--primary-color)' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
