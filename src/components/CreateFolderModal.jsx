import React, { useState } from 'react';
import api from '../utils/api';

const CreateFolderModal = ({ isOpen, onClose, onSuccess, clientId, type }) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        setError('');

        try {
            const endpoint = type === 'videos' ? '/videofolders' : '/imagefolders';
            await api.post(endpoint, {
                title: title.trim(),
                adminId: clientId
            });
            onSuccess();
            onClose();
            setTitle('');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to create ${type.slice(0, -1)} folder`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-slide-up">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                            <span>{type === 'videos' ? '📁' : '📂'}</span>
                            Create {type === 'videos' ? 'Video' : 'Image'} Folder
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Folder Title</label>
                            <input
                                autoFocus
                                required
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="Enter folder name..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

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
                                disabled={loading || !title.trim()}
                                type="submit"
                                className={`flex-1 px-6 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 ${type === 'videos' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
                                    }`}
                            >
                                {loading ? 'Creating...' : 'Create Folder'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;
