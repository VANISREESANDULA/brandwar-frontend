import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateBlogModal = ({ isOpen, onClose, onSuccess, clientId, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        keywords: '',
        description: '',
        status: 'draft',
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
                status: initialData.status || 'draft',
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
                status: 'draft',
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
                // New image flash
                contents.push({
                    type: 'image',
                    content: '', // Backend will replace
                    order: 2
                });
                data.append('image', image);
            } else if (imagePreview && !imagePreview.startsWith('data:')) {
                // Kept existing image
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
                await api.put(`/blogs/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/blogs', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 600);

            // Reset
            setFormData({ title: '', slug: '', keywords: '', description: '', status: 'draft' });
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#f0f2f5] w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Post' : 'Create New Post'}</h3>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            disabled={loading || !isFormValid}
                            onClick={handleSubmit}
                            className={`px-4 sm:px-6 py-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg ${isFormValid
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                                }`}
                        >
                            {loading ? 'Processing...' : (initialData ? 'Update Post' : 'Publish Post')}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Title & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end border-b border-slate-100 pb-8">
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter title..."
                                    className="w-full bg-transparent text-2xl md:text-3xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 p-0"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permalink / URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                />
                            </div>
                        </div>

                        {/* Description & Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            {/* Left Column: Editor */}
                            <div className="md:col-span-8 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Content Body</label>
                                    <div className="h-[400px] pb-12">
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description}
                                            onChange={value => setFormData({ ...formData, description: value })}
                                            placeholder="Start writing your story..."
                                            className="h-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Settings & Image */}
                            <div className="md:col-span-4 space-y-8">
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords (SEO)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. food, tech, lifestyle"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none"
                                            value={formData.keywords}
                                            onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Feature Image</label>
                                        {imagePreview ? (
                                            <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg aspect-video bg-white">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => document.getElementById('blog-image-upload').click()}
                                                        className="px-4 py-2 bg-white text-slate-900 font-bold text-[10px] uppercase rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                                                    >
                                                        Replace
                                                    </button>
                                                    <button
                                                        onClick={() => { setImage(null); setImagePreview(null); }}
                                                        className="px-4 py-2 bg-red-600 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-red-700 transition-all shadow-xl"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => document.getElementById('blog-image-upload').click()}
                                                className="w-full aspect-video rounded-3xl border-4 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-4 group"
                                            >
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🖼️</div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Upload Header Image</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">PNG, JPG up to 10MB</p>
                                                </div>
                                            </button>
                                        )}
                                        <input
                                            id="blog-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Status: {formData.status}</p>
                                    </div>
                                    <p className="text-[10px] text-blue-400 font-medium leading-relaxed">Your changes will be live instantly after you click publish.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBlogModal;
