import React from 'react';

const VideoListing = ({ video, folder, onDetails }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="aspect-video bg-slate-950 relative flex items-center justify-center text-white">
                <span
                    className="text-4xl filter drop-shadow-lg group-hover:scale-125 transition-transform cursor-pointer"
                    onClick={() => onDetails(video)}
                >
                    ▶️
                </span>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                    {video.language} • {folder.title}
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-bold text-slate-900 truncate">{video.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                    {video.location}
                </p>
            </div>
        </div>
    );
};

export default VideoListing;
