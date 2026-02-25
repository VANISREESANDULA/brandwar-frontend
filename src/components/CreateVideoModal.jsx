import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CreateVideoModal = ({ isOpen, onClose, onSuccess, clientId }) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderTitle, setNewFolderTitle] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        language: 'English',
        location: '',
        url: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFolders();
        }
    }, [isOpen]);

    const fetchFolders = async () => {
        try {
            const response = await api.get('/videos');
            setFolders(response.data);
            if (response.data.length > 0 && !selectedFolderId) {
                setSelectedFolderId(response.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch folders');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderTitle.trim()) return;
        setLoading(true);
        try {
            const response = await api.post('/videos', { title: newFolderTitle, adminId: clientId });
            setFolders([response.data, ...folders]);
            setSelectedFolderId(response.data.id);
            setIsCreatingFolder(false);
            setNewFolderTitle('');
        } catch (err) {
            setError('Failed to create folder');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFolderId) {
            setError('Please select or create a folder');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.post(`/videos/${selectedFolderId}/videos`, formData);
            onSuccess();
            onClose();
            setFormData({ title: '', language: 'English', location: '', url: '' });
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

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Add Video Content</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Folder Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Select Folder</label>
                            <div className="flex gap-2">
                                {!isCreatingFolder ? (
                                    <>
                                        <select
                                            className="input-field"
                                            value={selectedFolderId}
                                            onChange={e => setSelectedFolderId(e.target.value)}
                                        >
                                            <option value="">Choose a folder...</option>
                                            {folders.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingFolder(true)}
                                            className="px-3 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                                        >
                                            ➕
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Folder name..."
                                            value={newFolderTitle}
                                            onChange={e => setNewFolderTitle(e.target.value)}
                                        />
                                        <button type="button" onClick={handleCreateFolder} className="px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                                        <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-3 bg-slate-100 rounded-lg text-slate-400">✕</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    placeholder="Video title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Language</label>
                                <select
                                    className="input-field"
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
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location / Category</label>
                            <input
                                required
                                type="text"
                                className="input-field"
                                placeholder="e.g. Hyderabad, Office..."
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">YouTube / Video URL</label>
                            <input
                                required
                                type="url"
                                className="input-field"
                                placeholder="https://youtube.com/watch?v=..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
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
