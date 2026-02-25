import React from 'react';

const ContentDetailModal = ({ isOpen, onClose, item, type = 'blog' }) => {
    if (!isOpen || !item) return null;

    const mainImage = item.contents?.find(c => c.type === 'image')?.content || item.url;
    const isVideo = type === 'video';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all border border-slate-100 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            {type === 'blog' ? '📝' : type === 'news' ? '📰' : type === 'video' ? '🎥' : '🖼️'}
                        </div>
                        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">{type} Detail</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title Area */}
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                            {item.title}
                        </h1>
                        {item.keywords && (
                            <div className="flex flex-wrap gap-2">
                                {item.keywords.split(',').map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {kw.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Featured Content (Image or Video) */}
                    {mainImage && !isVideo && (
                        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                            <img src={mainImage} alt={item.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    {isVideo && item.url && (
                        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-video bg-black">
                            <iframe
                                src={item.url.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                title={item.title}
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Description / Content */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {item.description || item.location}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentDetailModal;
