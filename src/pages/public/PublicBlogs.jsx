import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../utils/api';
import { getValidImageUrl } from '../../utils/imageUtils';

const PublicBlogs = () => {
    const { website } = useParams();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // publicRoutes expects :website
                const response = await api.get(`/public/${website}/blogs`);
                setBlogs(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public blogs:", err);
                setError("Unable to load blogs at this time.");
            } finally {
                setLoading(false);
            }
        };

        if (website) fetchBlogs();
    }, [website]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
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

    if (blogs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-transparent p-4 text-slate-400 text-sm italic">
                No blogs published yet.
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent overflow-x-hidden p-4 md:p-6 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {blogs.map((blog) => {
                    const imageBlock = blog.contents?.find(c => c.type === "image");
                    const imageUrl = imageBlock ? getValidImageUrl(imageBlock.content) : null;

                    return (
                        <article
                            key={blog.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer h-full"
                        >
                            <div className="relative aspect-video overflow-hidden bg-slate-50">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200 text-4xl">
                                        📝
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 block">
                                    {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                                    {blog.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default PublicBlogs;
