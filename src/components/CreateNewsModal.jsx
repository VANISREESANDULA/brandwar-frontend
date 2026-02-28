import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateNewsModal = ({ isOpen, onClose, onSuccess, clientId, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        keywords: '',
        description: '',
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                keywords: initialData.keywords || '',
                description: initialData.description || '',
            });
            const imageBlock = initialData.contents?.find(c => c.type === 'image');
            setImagePreview(imageBlock?.content || null);
            setImage(null);
        } else {
            setFormData({
                title: '',
                slug: '',
                keywords: '',
                description: '',
            });
            setImage(null);
            setImagePreview(null);
        }
    }, [initialData, isOpen]);

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title && !formData.slugManuallyEdited) {
            const generatedSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title]);

    const handleSlugChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, slug: val, slugManuallyEdited: true });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const isFormValid = formData.title.trim() !== '' && formData.description.replace(/<[^>]*>?/gm, '').trim() !== '';

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('slug', formData.slug);
            data.append('keywords', formData.keywords);
            data.append('description', formData.description);

            const contents = [
                {
                    type: 'text',
                    content: formData.description,
                    order: 1
                }
            ];

            if (image) {
                contents.push({
                    type: 'image',
                    content: '',
                    order: 2
                });
                data.append('image', image);
            } else if (imagePreview && !imagePreview.startsWith('data:')) {
                contents.push({
                    type: 'image',
                    content: imagePreview,
                    order: 2
                });
            }

            data.append('contents', JSON.stringify(contents));

            if (clientId) {
                data.append('ownerId', clientId);
            }

            if (initialData) {
                await api.put(`/news/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/news', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 600);

            setFormData({ title: '', slug: '', keywords: '', description: '' });
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create news');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-[#fcfcfc] w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
                <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                        {initialData ? 'Edit News' : 'Create News Report'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Headline</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter headline..."
                            className="w-full bg-transparent text-2xl md:text-3xl font-medium text-slate-900 placeholder:text-slate-300 border-red-500 border-none focus:ring-0 p-0"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div className="md:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Story Content</label>
                                <div className="h-96 pb-12">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={value => setFormData({ ...formData, description: value })}
                                        placeholder="Write the full report..."
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-5 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Featured Visual</label>
                                {imagePreview ? (
                                    <div className="relative group rounded-3xl overflow-hidden border-2 border-slate-100 shadow-2xl aspect-video bg-white">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => document.getElementById('news-image-upload').click()}
                                                className="px-6 py-3 bg-white text-slate-900 font-black text-[10px] uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                            >
                                                Change
                                            </button>
                                            <button
                                                onClick={() => { setImage(null); setImagePreview(null); }}
                                                className="px-6 py-3 bg-red-600 text-white font-black text-[10px] uppercase rounded-2xl hover:bg-red-700 transition-all shadow-xl"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => document.getElementById('news-image-upload').click()}
                                        className="w-full aspect-video rounded-[2.5rem] border-4 border-dashed border-slate-100 hover:border-red-500 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center gap-6 group"
                                    >
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🗞️</div>
                                        <div className="text-center">
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Add Media Asset</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">High resolution recommended</p>
                                        </div>
                                    </button>
                                )}
                                <input id="news-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 pl-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        placeholder="SEARCH TAGS..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-red-100 outline-none uppercase placeholder:text-slate-300"
                                        value={formData.keywords}
                                        onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={handleSlugChange}
                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1 hover:text-red-600 transition-colors"
                                >
                                    Slug: {formData.slug}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-slate-100 px-8 py-6 flex items-center justify-end">
                    <button
                        disabled={loading || !isFormValid}
                        onClick={handleSubmit}
                        className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl ${isFormValid
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 hover:-translate-y-1'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none'
                            }`}
                    >
                        {loading ? 'Submitting...' : (initialData ? 'Update Release' : 'Post News')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateNewsModal;
