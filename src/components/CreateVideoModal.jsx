import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CreateVideoModal = ({ isOpen, onClose, onSuccess, folderId, folderTitle, existingProjects = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        language: 'English',
        location: '',
        url: '',
        project_name: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showDropdown, setShowDropdown] = useState(false);
    const filteredProjects = existingProjects.filter(p =>
        p.toLowerCase().includes(formData.project_name.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderId) {
            setError('Folder context missing');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.post(`/videofolders/${folderId}/`, formData);
            onSuccess();
            onClose();
            setFormData({ title: '', language: 'English', location: '', url: '', project_name: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add video');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Add Video Content</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="Video title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Language</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
                                    value={formData.language}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Telugu</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Location / Category</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="e.g. Hyderabad, Office..."
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">YouTube URL</label>
                            <input
                                required
                                type="url"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="https://youtube.com/watch?v=..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>

                        {(folderTitle?.toLowerCase() === 'project' || folderTitle?.toLowerCase() === 'projects') && (
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Project Name</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        autoComplete="off"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                        placeholder="Select or enter project name..."
                                        value={formData.project_name}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setShowDropdown(false)}
                                        onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {showDropdown && filteredProjects.length > 0 && (
                                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[110] max-h-[200px] overflow-y-auto animate-slide-up">
                                            {filteredProjects.map((project) => (
                                                <button
                                                    key={project}
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent onBlur from firing before this
                                                        setFormData({ ...formData, project_name: project });
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 transition-colors flex items-center justify-between group"
                                                >
                                                    {project}
                                                    <span className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-widest text-purple-400">Select</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-[10px] text-slate-400 font-medium italic">
                                    💡 Type a new name to create a project or select an existing one from the dropdown.
                                </p>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-1 px-6 py-4 rounded-2xl bg-purple-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Video'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateVideoModal;
