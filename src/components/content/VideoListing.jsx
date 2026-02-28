import React, { useState } from 'react';

const VideoListing = ({ video, folder, onEdit, isSelected, onSelect, className }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
        }
        return null;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            videoId = match[2];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    };

    const thumbnail = getYouTubeThumbnail(video.url);

    return (
        <div
            className={`selectable-item relative bg-white rounded-2xl shadow-sm border ${isSelected ? 'border-purple-500 ring-2 ring-purple-100 shadow-lg' : 'border-slate-100'} overflow-hidden hover:shadow-xl transition-all group flex flex-col ${className || ''}`}
        >
            {/* Selection Checkbox */}
            {!isPlaying && (
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(video.id);
                        }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-black/40 backdrop-blur-md border-white/20 text-transparent hover:border-purple-400 group-hover:border-slate-500'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            )}

            <div className={`bg-slate-100 relative items-center justify-center text-slate-400 aspect-video group flex overflow-hidden ${isPlaying ? 'z-20' : ''}`}>
                {isPlaying ? (
                    <div className="w-full h-full relative">
                        <iframe
                            src={getYouTubeEmbedUrl(video.url)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all z-30"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <>
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <span className="text-4xl">🎥</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all duration-700" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                            <div
                                className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md shadow-2xl flex items-center justify-center scale-75 group-hover:scale-100 group-hover:bg-red-600 group-hover:text-white transition-all cursor-pointer ring-8 ring-white/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(true);
                                }}
                            >
                                <svg className="w-10 h-10 ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* subtle metadata overlay on top */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-x-4 group-hover:translate-x-0">
                            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {video.location || 'GLOBAL'}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(video);
                                }}
                                className="w-9 h-9 bg-white/10 hover:bg-purple-600 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center justify-center transition-all shadow-xl"
                                title="Edit Video"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="p-6 border-t border-slate-50 text-center flex flex-col items-center justify-center bg-white">
                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-2 line-clamp-2">
                    {video.title}
                </h4>
                <div className="flex flex-col items-center gap-1 opacity-60">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {video.language || 'English'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoListing;
