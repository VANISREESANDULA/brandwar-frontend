import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EditFolderModal = ({ isOpen, onClose, onSuccess, folder, type }) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (folder) {
            setTitle(folder.title);
        }
    }, [folder, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError('');

        try {
            const endpoint = type === 'videos' ? `/videofolders/${folder.id}` : `/imagefolders/${folder.id}`;
            await api.put(endpoint, { title });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update folder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span>✏️</span> Edit {type === 'videos' ? 'Folder' : 'Gallery'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title..."
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !title.trim()}
                                className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
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

export default EditFolderModal;
