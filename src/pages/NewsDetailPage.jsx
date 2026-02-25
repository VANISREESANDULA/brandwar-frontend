import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';

const NewsDetailPage = () => {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await api.get(`/news/${slug}`);
                setNews(response.data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [slug]);

    const getValidImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.includes("uploads")) {
            const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">News article not found</h2>
                <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    const mainImage = news.contents?.find(c => c.type === 'image')?.content;
    const imageUrl = mainImage ? getValidImageUrl(mainImage) : null;

    return (
        <div className="min-h-screen bg-slate-50/30">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Newsroom
                </button>

                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Press Release
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {format(new Date(news.createdAt), 'MMMM dd, yyyy')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                                {news.title}
                            </h1>
                        </div>

                        {imageUrl && (
                            <div className="rounded-3xl overflow-hidden shadow-lg">
                                <img src={imageUrl} alt={news.title} className="w-full h-auto object-cover max-h-[500px]" />
                            </div>
                        )}

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {news.description}
                            </p>
                        </div>

                        {news.keywords && (
                            <div className="pt-8 border-t border-slate-50">
                                <div className="flex flex-wrap gap-2">
                                    {news.keywords.split(',').map((kw, i) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-lg">
                                            #{kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetailPage;
