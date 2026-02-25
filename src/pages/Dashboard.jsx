import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Toast from '../components/Toast';

const StatCard = ({ title, value, icon, color, trend, isSuperAdmin }) => (
  <div className={`stat-card p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-200`}>
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-0.5 truncate uppercase tracking-widest">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{value}</p>
      </div>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl ${color} bg-slate-50 group-hover:bg-white transition-colors shrink-0 ml-2`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    holdClients: 0,
    totalContent: 0,
    totalBlogs: 0,
    totalNews: 0,
    totalVideos: 0,
    totalImages: 0
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admins');
        const allAdmins = response.data;
        const active = allAdmins.filter(a => a.isActive).length;
        const total = allAdmins.length;
        const inactive = allAdmins.filter(a => !a.isActive && !a.isDeleted).length;
        const hold = 0;

        // Fetch content counts
        const [blogRes, newsRes, videoRes, imageRes] = await Promise.all([
          api.get('/blogs'),
          api.get('/news'),
          api.get('/videofolders'),
          api.get('/imagefolders')
        ]);
        // console.log("blog", blogRes)
        // console.log("new", newsRes)
        // console.log("videos", videoRes)
        // console.log("images", imageRes)


        setStats({
          totalClients: total,
          activeClients: active,
          inactiveClients: inactive,
          holdClients: hold,
          totalContent: blogRes.data.length + newsRes.data.length + videoRes.data.length + imageRes.data.length,
          totalBlogs: blogRes.data.length,
          totalNews: newsRes.data.length,
          totalVideos: videoRes.data.length,
          totalImages: imageRes.data.length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setToast({ message: 'Failed to load statistics', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      {/* Welcome Section */}
      <div className="absolute top-0 right-0 w-64 h-64 text-black bg-white/10 rounded-full -mr-32 -mt-28 blur-3xl hidden sm:block"></div>
      <div
        className="sm:rounded-2xl sm:p-6 sm:bg-white sm:shadow-lg sm:border sm:border-slate-200 relative overflow-hidden bg-transparent p-0 shadow-none border-none mb-6 mt-1"
      >
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl mb-2 tracking-tight hidden sm:block"></div>

        <div className="relative z-10">
          <h1
            className="text-xl sm:text-2xl font-bold mb-1 tracking-tight truncate text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Welcome Back, <span style={{ color: 'var(--primary-color)' }}>{user?.name || 'Admin'}!</span>
          </h1>
          <p className="text-slate-500 flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Manage your blog and client ecosystem
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {isSuperAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon="👥"
            color="text-blue-600"
            isSuperAdmin={isSuperAdmin}
          />
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon="✅"
            color="text-green-600"
            isSuperAdmin={isSuperAdmin}
          />
          <StatCard
            title="Inactive Clients"
            value={stats.inactiveClients}
            icon="⏸️"
            color="text-slate-500"
            isSuperAdmin={isSuperAdmin}
          />
          <StatCard
            title="On Hold"
            value={stats.holdClients || 0}
            icon="⏳"
            color="text-amber-600"
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      )}

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Breakdown */}
        <div className="stat-card lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">{isSuperAdmin ? 'Global Content Breakdown' : 'My Content Ecosystem'}</h3>
            <span className="text-[10px] font-medium text-slate-500 py-1 px-3 bg-slate-100 rounded-full uppercase tracking-wider">Usage</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Blogs */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Blogs</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600 block leading-tight">{stats.totalBlogs}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-blue-600 text-xl sm:text-2xl shrink-0 ml-2">
                📝
              </div>
            </div>

            {/* News */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-red-100 bg-red-50/50">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">News</span>
                <span className="text-xl sm:text-2xl font-bold text-red-600 block leading-tight">{stats.totalNews}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-red-600 text-xl sm:text-2xl shrink-0 ml-2">
                📰
              </div>
            </div>

            {/* Videos */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-purple-100 bg-purple-50/50">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Videos</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-600 block leading-tight">{stats.totalVideos}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-purple-600 text-xl sm:text-2xl shrink-0 ml-2">
                🎥
              </div>
            </div>

            {/* Images */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-teal-100 bg-teal-50/50">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Images</span>
                <span className="text-xl sm:text-2xl font-bold text-teal-600 block leading-tight">{stats.totalImages}</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-teal-600 text-xl sm:text-2xl shrink-0 ml-2">
                🖼️
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="stat-card">
          <h3 className="text-xl font-bold text-slate-900 mb-6 font-black uppercase tracking-widest text-xs">Propulsion</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {!isSuperAdmin && (
              <button
                onClick={() => window.location.href = `/clients/${user.id}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-700 text-sm group-hover:text-slate-900 truncate">My Content</div>
                  <div className="text-[10px] text-slate-500 truncate">Manage all modules</div>
                </div>
              </button>
            )}
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => window.location.href = '/add-client'}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-700 text-sm group-hover:text-slate-900 truncate">Add Client</div>
                    <div className="text-[10px] text-slate-500 truncate">New register</div>
                  </div>
                </button>
                <button
                  onClick={() => window.location.href = '/clients'}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group text-left shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-700 text-sm group-hover:text-slate-900 truncate">Directory</div>
                    <div className="text-[10px] text-slate-500 truncate">All accounts</div>
                  </div>
                </button>
              </>
            )}
            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group text-left shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                👤
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-700 text-sm group-hover:text-slate-900 truncate">My Profile</div>
                <div className="text-[10px] text-slate-500 truncate">Account management</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">System Logs</h3>
          <button className="text-xs font-semibold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="space-y-2">
          {[
            { action: 'Sync success', desc: 'Stats updated', time: 'Just now', type: 'success', icon: '⚡' },
            { action: 'New Client', desc: 'Onboarding TechCorp', time: '2h ago', type: 'info', icon: '✨' },
            { action: 'Report Ready', desc: 'Feb statistics', time: '5h ago', type: 'info', icon: '📊' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${activity.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-sm truncate">{activity.action}</p>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{activity.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{activity.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
