import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EditItemModal = ({ isOpen, onClose, onSuccess, item, type, folderTitle, existingProjects = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        location: '',
        language: '',
        project_name: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const filteredProjects = existingProjects.filter(p =>
        p.toLowerCase().includes(formData.project_name.toLowerCase())
    );

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || '',
                url: item.url || '',
                location: item.location || '',
                language: item.language || '',
                project_name: item.project_name || ''
            });
        }
    }, [item, isOpen]);

    if (!isOpen || type !== 'videos') return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.put(`/videofolders/videos/${item.id}`, formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update video');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>🎬</span> Edit Video Details
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Video Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter title..."
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">YouTube URL</label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://youtube.com/watch?v=..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Language</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all transition-all"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    placeholder="e.g. English"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Location</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. New York"
                                />
                            </div>

                            {(folderTitle?.toLowerCase() === 'project' || folderTitle?.toLowerCase() === 'projects') && (
                                <div className="md:col-span-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Project Name</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            autoComplete="off"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            value={formData.project_name}
                                            onFocus={() => setShowDropdown(true)}
                                            onBlur={() => setShowDropdown(false)}
                                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                            placeholder="Select or enter project name..."
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className={`w-3.4 h-3.4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {showDropdown && filteredProjects.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[160] max-h-[160px] overflow-y-auto animate-slide-up">
                                                {filteredProjects.map((project) => (
                                                    <button
                                                        key={project}
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setFormData({ ...formData, project_name: project });
                                                            setShowDropdown(false);
                                                        }}
                                                        className="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 transition-colors flex items-center justify-between group"
                                                    >
                                                        {project}
                                                        <span className="opacity-0 group-hover:opacity-100 text-[9px] uppercase tracking-widest text-purple-400 font-black">Select</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-[10px] text-slate-400 font-medium italic">
                                        💡 Type a new name to create a project or select an existing one.
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                        )}

                        <div className="flex gap-3 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 font-bold"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditItemModal;
