import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { getValidImageUrl } from '../../utils/imageUtils';

const PublicImages = () => {
    const { website } = useParams();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await api.get(`/public/${website}/images`);
                setFolders(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch public images:", err);
                setError("Unable to load images at this time.");
            } finally {
                setLoading(false);
            }
        };

        if (website) fetchImages();
    }, [website]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
                <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
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

    // Flatten all images from all folders for a seamless public view
    const allImages = folders.flatMap(folder => folder.images || []);

    if (allImages.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[300px] bg-transparent p-4 text-slate-400 text-sm italic">
                No images available.
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent overflow-x-hidden p-4 md:p-6 font-sans">
            {/* Masonry-style Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6 space-y-6">
                {allImages.map((image) => {
                    const imageUrl = getValidImageUrl(image.url);
                    return (
                        <div
                            key={image.id}
                            className="break-inside-avoid bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
                        >
                            <img
                                src={imageUrl}
                                alt={image.title || 'Image'}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            {image.title && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <h4 className="text-white font-bold text-lg leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {image.title}
                                    </h4>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PublicImages;
