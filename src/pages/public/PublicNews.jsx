import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../utils/api';
import { getValidImageUrl } from '../../utils/imageUtils';

const PublicNews = () => {
    const { website } = useParams();
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await api.get(`/public/${website}/news`);
                setNewsItems(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public news:", err);
                setError("Unable to load news at this time.");
            } finally {
                setLoading(false);
            }
        };

        if (website) fetchNews();
    }, [website]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
                <div className="w-8 h-8 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent p-4 text-slate-500 font-medium text-sm">
                {error}
            </div>
        );
    }

    if (newsItems.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-transparent p-4 text-slate-400 text-sm italic">
                No press releases available.
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent overflow-x-hidden p-4 md:p-6 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {newsItems.map((news) => {
                    const imageBlock = news.contents?.find(c => c.type === "image");
                    const imageUrl = imageBlock ? getValidImageUrl(imageBlock.content) : null;

                    return (
                        <article
                            key={news.id}
                            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
                        >
                            <div className="relative aspect-video overflow-hidden bg-slate-100">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={news.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200 text-5xl">
                                        📰
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Press Release
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {format(new Date(news.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                                    {news.title}
                                </h3>

                                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
                                    {news.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default PublicNews;
