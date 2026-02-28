import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CreateImageModal = ({ isOpen, onClose, onSuccess, folderId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // Add unique files to the list
        setFiles(prev => {
            const newFiles = [...prev];
            selectedFiles.forEach(file => {
                if (!newFiles.some(f => f.name === file.name && f.size === file.size)) {
                    newFiles.push(file);
                }
            });
            return newFiles;
        });
        setError('');
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setFiles([]);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderId) {
            setError('Folder context missing');
            return;
        }
        if (files.length === 0) {
            setError('Please select at least one image');
            return;
        }

        setLoading(true);
        setError('');
        setProgress({ current: 0, total: files.length });

        try {
            for (let i = 0; i < files.length; i++) {
                setProgress(prev => ({ ...prev, current: i + 1 }));
                const data = new FormData();
                data.append('image', files[i]);
                await api.post(`/imagefolders/${folderId}/`, data);
            }
            onSuccess();
            onClose();
            setFiles([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload some images');
        } finally {
            setLoading(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Upload Images</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-upload enabled</p>
                        </div>
                        <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`relative group border-2 border-dashed ${files.length > 0 ? 'border-teal-400 bg-teal-50/20' : 'border-slate-200'} rounded-[2rem] p-8 transition-all hover:border-teal-400 hover:bg-teal-50/30 flex flex-col items-center justify-center space-y-3 cursor-pointer`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-500">
                                {loading ? '⏳' : '📸'}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                    Click to browse images
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {loading ? 'Uploading sequentially...' : 'Select one or more files to add'}
                                </p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{files.length} FILES QUEUED</span>
                                    <button
                                        type="button"
                                        onClick={clearFiles}
                                        disabled={loading}
                                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-lg">🖼️</span>
                                            <span className="text-xs font-bold text-slate-600 truncate">{f.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            disabled={loading}
                                            className="p-1 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span>Uploading File {progress.current} of {progress.total}</span>
                                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-teal-600 transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading || files.length === 0}
                                type="submit"
                                className="flex-1 px-6 py-4 rounded-2xl bg-teal-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Uploading...</span>
                                    </>
                                ) : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateImageModal;
