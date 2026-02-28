import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../utils/api';

import { slugify } from '../utils/slugify';
import { useAuth } from '../contexts/AuthContext';

const BlogDetailPage = () => {
    const { companySlug, slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, isSuperAdmin } = useAuth();

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                let client;
                if (isSuperAdmin) {
                    const adminsResponse = await api.get('/admins');
                    client = adminsResponse.data.find(c => slugify(c.company_name) === companySlug);
                } else {
                    client = user;
                }

                if (!client) {
                    setBlog(null);
                    return;
                }

                const response = await api.get(`/blogs`);
                const foundBlog = response.data.find(b =>
                    b.slug === slug &&
                    (b.userId === client.id || b.user?.id === client.id)
                );
                setBlog(foundBlog);
            } catch (error) {
                console.error("Failed to fetch blog:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [companySlug, slug]);

    const getValidImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.includes("uploads")) {
            const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return `http://localhost:4000/uploads/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">Blog not found</h2>
                <button onClick={() => navigate(`/${companySlug}/blogs`)} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    const mainImage = blog.contents?.find(c => c.type === 'image')?.content;
    const imageUrl = mainImage ? getValidImageUrl(mainImage) : null;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(`/${companySlug}/blogs`)}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Collection
                </button>

                <div className="space-y-8 animate-slide-up">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Blog Post
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                            {blog.title}
                        </h1>
                    </div>

                    {imageUrl && (
                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 aspect-video">
                            <img src={imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="prose prose-slate max-w-none">
                        <p className="text-xl text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {blog.description}
                        </p>
                    </div>

                    {blog.keywords && (
                        <div className="pt-12 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Discovery Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {blog.keywords.split(',').map((kw, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 hover:bg-white transition-colors">
                                        #{kw.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
