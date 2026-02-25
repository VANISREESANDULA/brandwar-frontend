import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import BlogListing from '../components/content/BlogListing';
import NewsListing from '../components/content/NewsListing';
import ContentDetailModal from '../components/ContentDetailModal';

const Profile = () => {
    const { user } = useAuth();
    const [userContent, setUserContent] = useState({ blogs: [], news: [] });
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        const fetchUserContent = async () => {
            try {
                const [blogsRes, newsRes] = await Promise.all([
                    api.get('/blogs'),
                    api.get('/news')
                ]);

                const myBlogs = blogsRes.data.filter(b => (b.user?.id === user.id || b.userId === user.id));
                const myNews = newsRes.data.filter(n => (n.user?.id === user.id || n.userId === user.id));

                setUserContent({ blogs: myBlogs, news: myNews });
            } catch (error) {
                console.error("Failed to fetch user content:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchUserContent();
    }, [user]);

    const getValidImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.includes("uploads")) {
            const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return null;
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Hero Profile Header */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-slate-900 relative flex flex-col items-center justify-center p-12 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                            <div className="relative z-10 text-center">
                                <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-5xl font-black text-white shadow-2xl mb-6 mx-auto transform hover:rotate-6 transition-transform">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">{user.name}</h1>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                    {user.role}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Core Identity</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem label="Legal Name" value={user.name} />
                                        <InfoItem label="Email Address" value={user.email} />
                                        <InfoItem label="Phone Line" value={user.phoneNumber} />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Business & Stats</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem label="Company" value={user.companyName || 'Brandwar Ecosystem'} />
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Prowess</p>
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                    <p className="text-2xl font-black text-slate-900">{userContent.blogs.length}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Blogs</p>
                                                </div>
                                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                    <p className="text-2xl font-black text-slate-900">{userContent.news.length}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updates</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 gap-12 pt-6">
                    {/* Blogs Section */}
                    {user.allowBlogs && (
                        <ContentSection
                            title="My Published Blogs"
                            icon="📝"
                            color="blue"
                            loading={loading}
                            items={userContent.blogs}
                            renderItem={(item) => (
                                <BlogListing
                                    key={item.id}
                                    item={item}
                                    getValidImageUrl={getValidImageUrl}
                                    onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                                    onEdit={() => { }} // Disabled in profile for now
                                    onDelete={() => { }}
                                />
                            )}
                        />
                    )}

                    {/* News Section */}
                    {user.allowNews && (
                        <ContentSection
                            title="My Press Releases"
                            icon="📰"
                            color="red"
                            loading={loading}
                            items={userContent.news}
                            renderItem={(item) => (
                                <NewsListing
                                    key={item.id}
                                    item={item}
                                    getValidImageUrl={getValidImageUrl}
                                    onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                />
                            )}
                        />
                    )}
                </div>
            </div>

            <ContentDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                item={selectedItem}
                type={selectedItem?.slug ? 'blog' : 'news'}
            />
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-extrabold text-sm">{value || 'Not Configured'}</p>
    </div>
);

const ContentSection = ({ title, icon, color, loading, items, renderItem }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-4">
                <span className={`w-10 h-10 rounded-2xl bg-${color}-50 flex items-center justify-center text-xl shadow-sm`}>{icon}</span>
                {title}
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {items.length}</span>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                ))}
            </div>
        ) : items.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 text-center">
                <p className="text-slate-300 font-black text-sm uppercase tracking-widest">No content discovered yet</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(renderItem)}
            </div>
        )}
    </div>
);

export default Profile;

