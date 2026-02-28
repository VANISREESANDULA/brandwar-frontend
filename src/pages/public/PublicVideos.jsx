import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const PublicVideos = () => {
    const { website } = useParams();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedProject, setSelectedProject] = useState('All');

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.get(`/public/${website}/videos`);
                setFolders(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public videos:", err);
                setError("Unable to load videos at this time.");
            } finally {
                setLoading(false);
            }
        };

        if (website) fetchVideos();
    }, [website]);

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
        } else if (url.includes("embed/")) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
                <div className="w-8 h-8 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
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

    if (folders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-transparent p-4 text-slate-400 text-sm italic">
                No video folders available.
            </div>
        );
    }

    // Folder List View
    if (!selectedFolder) {
        return (
            <div className="w-full bg-transparent overflow-x-hidden p-4 md:p-6 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            onClick={() => setSelectedFolder(folder)}
                            className="relative group rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 bg-white min-h-[250px] flex flex-col cursor-pointer"
                        >
                            <div className="absolute inset-0 z-0">
                                {folder.videos?.[0] ? (
                                    <img
                                        src={getYouTubeThumbnail(folder.videos[0].url)}
                                        alt=""
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center opacity-40">
                                        <span className="text-4xl">🎥</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-1" />
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col justify-end p-8">
                                <h4 className="font-black text-white text-2xl uppercase tracking-tighter drop-shadow-xl group-hover:translate-x-1 transition-transform">
                                    {folder.title}
                                </h4>
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.3em] drop-shadow-md mt-1">
                                    {folder.videos?.length || 0} Videos <span className="mx-1">•</span> View Folder
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Video Grid View (inside a folder)
    const isProjectFolder = selectedFolder.title?.toLowerCase() === 'project' || selectedFolder.title?.toLowerCase() === 'projects';
    const folderVideos = selectedFolder.videos || [];

    // Extract projects for the selected folder
    const projects = Array.from(new Set(folderVideos.map(v => v.project_name).filter(Boolean)));

    const filteredVideos = (isProjectFolder && selectedProject !== 'All')
        ? folderVideos.filter(v => v.project_name === selectedProject)
        : folderVideos;

    return (
        <div className="w-full bg-transparent overflow-x-hidden p-4 md:p-6 font-sans animate-slide-up">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => {
                            setSelectedFolder(null);
                            setSelectedProject('All');
                        }}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-[10px] uppercase tracking-[0.2em] mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Gallery
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
                        {selectedFolder.title}
                    </h1>
                </div>
            </div>

            {/* Project Tabs for Project Folders */}
            {isProjectFolder && projects.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    <button
                        onClick={() => setSelectedProject('All')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm ${selectedProject === 'All'
                            ? 'bg-purple-600 text-white shadow-purple-100'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-600 hover:text-purple-600'
                            }`}
                    >
                        All
                    </button>
                    {projects.map((project) => (
                        <button
                            key={project}
                            onClick={() => setSelectedProject(project)}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm ${selectedProject === project
                                ? 'bg-[#004a99] text-white shadow-[#004a99]/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#004a99] hover:text-[#004a99]'
                                }`}
                        >
                            {project}
                        </button>
                    ))}
                </div>
            )}

            {isProjectFolder && selectedProject !== 'All' && (
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">
                        {selectedProject} VIRTUAL TOUR
                    </h2>
                    <div className="w-20 h-1 bg-red-500 mx-auto rounded-full" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredVideos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="relative aspect-video bg-slate-900 w-full overflow-hidden">
                            <iframe
                                src={getYouTubeEmbedUrl(video.url)}
                                title={video.title}
                                className="w-full h-full border-0 absolute top-0 left-0 group-hover:scale-105 transition-transform duration-700"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                        <div className="p-6 border-t border-slate-50 text-center">
                            <h4 className="text-sm font-black text-slate-800 line-clamp-2 uppercase tracking-tight mb-1">
                                {video.title}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {video.language || 'English'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PublicVideos;
