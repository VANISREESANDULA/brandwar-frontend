import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const GalleryFolderPage = () => {
    const { id, type, folderId, folderTitle } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getValidImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.includes("uploads")) {
            const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = type === 'images' ? '/imagefolders' : '/videofolders';
                const response = await api.get(endpoint);
                const folder = response.data.find(f => f.id === folderId);
                setData(folder);
            } catch (error) {
                console.error("Failed to fetch gallery folder:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [folderId, type]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const items = type === 'images' ? data.images : data.videos;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Gallery
                        </button>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            {data.title}
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
                            Showing {items?.length || 0} {type}
                        </p>
                    </div>
                </div>

                {/* Custom 2,3,4 Grid Layout - Masonry Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 auto-rows-[280px]">
                    {items?.map((item, index) => {
                        // Pattern to mimic the "Googe" premium masonry feel
                        // Slot 1: Large Featured (8 cols, 2 rows)
                        // Slot 2: Standard (4 cols, 1 row)
                        // Slot 3: Standard (4 cols, 1 row)
                        // Slot 4: Wide (6 cols, 1 row)
                        // Slot 5: Wide (6 cols, 1 row)
                        // Slot 6: Tall (4 cols, 2 rows)

                        let colSpan = "lg:col-span-4";
                        let rowSpan = "row-span-1";

                        const patternIndex = index % 10;
                        if (patternIndex === 0) { colSpan = "lg:col-span-8"; rowSpan = "row-span-2"; }
                        else if (patternIndex === 1) { colSpan = "lg:col-span-4"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 2) { colSpan = "lg:col-span-4"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 3) { colSpan = "lg:col-span-6"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 4) { colSpan = "lg:col-span-6"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 5) { colSpan = "lg:col-span-4"; rowSpan = "row-span-2"; }
                        else if (patternIndex === 6) { colSpan = "lg:col-span-8"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 7) { colSpan = "lg:col-span-5"; rowSpan = "row-span-1"; }
                        else if (patternIndex === 8) { colSpan = "lg:col-span-7"; rowSpan = "row-span-1"; }
                        else { colSpan = "lg:col-span-12"; rowSpan = "row-span-1"; }

                        return (
                            <div
                                key={item.id}
                                className={`relative group rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white ${colSpan} ${rowSpan}`}
                            >
                                {type === 'images' ? (
                                    <>
                                        <img
                                            src={getValidImageUrl(item.url)}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Captured</p>
                                            <h4 className="text-white font-bold text-lg">Visual Archive ITEM-{index + 1}</h4>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-slate-900 relative">
                                        <iframe
                                            src={item.url.replace('watch?v=', 'embed/')}
                                            className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                            title={item.title}
                                            allowFullScreen
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
                                        <div className="absolute bottom-6 left-8 text-white pointer-events-none group-hover:translate-y-[-10px] transition-transform">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{item.language}</p>
                                            </div>
                                            <h4 className="font-black text-xl leading-tight">{item.title}</h4>
                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">{item.location}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {items?.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-100">
                        <p className="text-slate-300 font-black text-xs uppercase tracking-[0.3em]">Vault is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryFolderPage;
