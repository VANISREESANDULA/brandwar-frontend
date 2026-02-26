import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CreateNewsModal = ({ isOpen, onClose, onSuccess, clientId, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        keywords: '',
        image: '',
        description: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                keywords: initialData.keywords || '',
                description: initialData.description || '',
                // image: initialData.image || '',
            });
            const imageBlock = initialData.contents?.find(c => c.type === 'image');
            if (imageBlock) {
                setImagePreview(imageBlock.content);
            }
        } else {
            setFormData({
                title: '',
                slug: '',
                keywords: '',
                image: '',
                description: '',
            });
            setImage(null);
            setImagePreview(null);
        }
    }, [initialData, isOpen]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    const isFormValid = formData.title.trim() !== '' && formData.description.trim() !== '';

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

            const existingImageBlock = initialData?.contents?.find(c => c.type === 'image');

            if (image) {
                contents.push({
                    type: 'image',
                    content: '',
                    order: 0,
                    ...(existingImageBlock && { id: existingImageBlock.id })
                });
                data.append('image', image);
            } else if (imagePreview && !imagePreview.startsWith('data:')) {
                if (existingImageBlock) {
                    contents.push(existingImageBlock);
                }
            }

            data.append('contents', JSON.stringify(contents));
            if (clientId) data.append('ownerId', clientId);

            if (initialData) {
                await api.put(`/news/${initialData.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/news', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onClose();
            setTimeout(() => {
                onSuccess();
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

            <div className="relative bg-[#fdfdfd] w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-bold text-slate-900">{initialData ? 'Edit News' : 'Add Press Release'}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={loading || !isFormValid}
                            onClick={handleSubmit}
                            className={`px-6 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg ${isFormValid
                                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                                }`}
                        >
                            {loading ? 'Processing...' : (initialData ? 'Update News' : 'Publish Update')}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Row 1: Headline & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end border-b border-slate-100 pb-8">
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline / Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter news headline..."
                                    className="w-full bg-transparent text-3xl font-extrabold text-slate-900 placeholder:text-slate-200 border-none focus:ring-0 p-0"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permalink / URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-red-600 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                    placeholder="news-slug"
                                />
                            </div>
                        </div>

                        {/* Row 2: Content & Illustration */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                            {/* Editor Area */}
                            <div className="md:col-span-3 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Content</label>
                                <textarea
                                    required
                                    rows="12"
                                    placeholder="Write the full story here... *"
                                    className="w-full bg-slate-50 rounded-2xl p-6 text-slate-700 placeholder:text-slate-200 border border-slate-200 focus:bg-white focus:border-red-400 focus:ring-8 focus:ring-red-50 transition-all resize-none shadow-inner leading-relaxed text-lg"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Image Selection Area */}
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Illustration</label>
                                <div className="relative aspect-square md:aspect-auto md:h-full max-h-[400px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:bg-slate-100 transition-all group shadow-inner">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                                                    Change
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                                <button
                                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-4 p-10 text-center">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">📰</div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Click to upload</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Capture the moment</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Keywords */}
                        <div className="border-t border-slate-100 pt-8 space-y-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Keywords (Comma Separated)</label>
                                <input
                                    type="text"
                                    placeholder="breaking, update, press-release, brandwar"
                                    className="w-full text-lg p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-8 focus:ring-red-50 transition-all outline-none font-medium shadow-inner"
                                    value={formData.keywords}
                                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                <span className="text-lg">🚫</span>
                                <p className="text-red-600 text-xs font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewsModal;
