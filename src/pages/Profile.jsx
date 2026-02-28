import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import BlogListing from '../components/content/BlogListing';
import NewsListing from '../components/content/NewsListing';
import ContentDetailModal from '../components/ContentDetailModal';

const Profile = () => {
    const { user, isSuperAdmin, login } = useAuth();
    const [userContent, setUserContent] = useState({ blogs: [], news: [] });
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || user.contact_number || '',
                ...(isSuperAdmin ? {
                    company_name: user.company_name || user.companyName || '',
                    website: user.website || '',
                    address: user.address || '',
                } : {})
            });

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
                    console.error('Failed to fetch user content:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserContent();
        }
    }, [user]);

    const getValidImageUrl = (url) => {
        if (!url || url === "default-logo.png") return "/brandwar-01.png";
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.includes('uploads')) {
            const cleanPath = url.split('uploads')[1].replace(/\\/g, '/');
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return `http://localhost:4000/uploads/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const endpoint = isSuperAdmin ? `/admins/${user.id}` : `/admins/${user.id}`;
            const res = await api.put(endpoint, editForm);
            login({ ...user, ...res.data }, localStorage.getItem('token'));
            setIsEditing(false);
            setToast('Profile updated successfully!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            console.error('Failed to save profile:', err);
            setToast('Failed to update profile.');
            setTimeout(() => setToast(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    const logoUrl = getValidImageUrl(user.logo);
    const avatarLetter = user.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Toast */}
                {toast && (
                    <div className="fixed top-6 right-6 z-50 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl text-sm font-bold">
                        {toast}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900/50 px-10 py-8 flex items-center gap-8">
                        {/* Avatar - always letter-based */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-2xl flex items-center border bg-white justify-center text-5xl font-black text-slate-800 shadow-lg overflow-hidden">
                                <img
                                    src={getValidImageUrl(user.logo)}
                                    alt={`${user.name} Logo`}
                                    className="w-full h-full object-contain p-3"
                                    style={{ display: getValidImageUrl(user.logo) ? 'block' : 'none' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) {
                                            e.target.nextElementSibling.style.display = 'block';
                                        }
                                    }}
                                />
                                <span style={{ display: getValidImageUrl(user.logo) ? 'none' : 'block' }}>
                                    {avatarLetter}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                                {user.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    {user.role}
                                </span>
                                {isSuperAdmin && (
                                    <span className="text-white/50 text-xs font-bold truncate">
                                        {user.company_name || user.companyName || 'Brandwar Ecosystem'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* <button
                            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            {isEditing ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </>
                            )}
                        </button> */}
                    </div>

                    {/* Body */}
                    <div className="p-8 md:p-10">
                        {isEditing ? (
                            /* --- EDIT MODE --- */
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Edit Your Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Full Name" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
                                    <FormField label="Email Address" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} type="email" />
                                    <FormField label="Phone Number" value={editForm.phoneNumber} onChange={v => setEditForm(f => ({ ...f, phoneNumber: v }))} />
                                    {isSuperAdmin && (
                                        <>
                                            <FormField label="Company Name" value={editForm.company_name} onChange={v => setEditForm(f => ({ ...f, company_name: v }))} />
                                            <FormField label="Website" value={editForm.website} onChange={v => setEditForm(f => ({ ...f, website: v }))} />
                                            <FormField label="Address" value={editForm.address} onChange={v => setEditForm(f => ({ ...f, address: v }))} />
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* --- VIEW MODE --- */
                            isSuperAdmin ? (
                                /* SUPER ADMIN: Full company details */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Personal Info</h3>
                                        <div className="space-y-6">
                                            <InfoItem label="Full Name" value={user.name} />
                                            <InfoItem label="Email Address" value={user.email} />
                                            <InfoItem label="Phone Number" value={user.phoneNumber || user.contact_number} />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Company Details</h3>
                                        <div className="space-y-6">
                                            <InfoItem label="Company Name" value={user.company_name || user.companyName} />
                                            <InfoItem label="Website" value={user.website} />
                                            <InfoItem label="Address" value={user.address} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ADMIN: Just personal info */
                                <div className="max-w-lg space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Profile Information</h3>
                                    <div className="space-y-6">
                                        <InfoItem label="Full Name" value={user.name} />
                                        <InfoItem label="Email Address" value={user.email} />
                                        <InfoItem label="Phone Number" value={user.phoneNumber || user.contact_number} />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Published Content — Admin only */}
                {!isSuperAdmin && (user.allowBlogs || user.allowNews) && (
                    <div className="space-y-10">
                        {user.allowBlogs && (
                            <ContentSection
                                title="My Published Blogs"
                                icon="📝"
                                loading={loading}
                                items={userContent.blogs}
                                renderItem={(item) => (
                                    <BlogListing
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
                        {user.allowNews && (
                            <ContentSection
                                title="My Press Releases"
                                icon="📰"
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
                )}
            </div>

        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-slate-900 font-extrabold text-sm">{value || <span className="text-slate-300 font-medium">Not configured</span>}</p>
    </div>
);

const FormField = ({ label, value, onChange, type = 'text' }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        />
    </div>
);

const ContentSection = ({ title, icon, loading, items, renderItem }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-sm">{icon}</span>
                {title}
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {items.length}</span>
        </div>
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-white rounded-3xl border border-slate-100 animate-pulse" />)}
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
