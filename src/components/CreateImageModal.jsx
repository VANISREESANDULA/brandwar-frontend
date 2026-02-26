import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CreateImageModal = ({ isOpen, onClose, onSuccess, clientId }) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderTitle, setNewFolderTitle] = useState('');

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // useEffect(() => {
    //     if (isOpen) {
    //         fetchFolders();
    //     }
    // }, [isOpen]);

    // const fetchFolders = async () => {
    //     try {
    //         const response = await api.get('/imagefolders');
    //         setFolders(response.data);
    //         if (response.data.length > 0 && !selectedFolderId) {
    //             setSelectedFolderId(response.data[0].id);
    //         }
    //     } catch (err) {
    //         console.error('Failed to fetch folders');
    //     }
    // };

    const handleCreateFolder = async () => {
        if (!newFolderTitle.trim()) return;
        setLoading(true);
        try {
            const response = await api.post(`/imagefolders`, { title: newFolderTitle, adminId: clientId });
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
        if (!file) {
            setError('Please select an image');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('image', file);
            await api.post(`/imagefolders/${selectedFolderId}/`, data);
            onSuccess();
            onClose();
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image');
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
                        <h3 className="text-xl font-bold text-slate-900">Upload Image</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all hover:border-teal-400 hover:bg-teal-50/50 flex flex-col items-center justify-center space-y-3 cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <div className="text-4xl">📸</div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-700">{file ? file.name : 'Click to upload image'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 5MB</p>
                            </div>
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
                                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateImageModal;
