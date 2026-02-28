import React from 'react';

const ImageListing = ({ image, onDetails, onEdit, isSelected, onSelect, className }) => {
    return (
        <div
            className={`selectable-item relative bg-white rounded-2xl shadow-sm border ${isSelected ? 'border-teal-500 ring-4 ring-teal-100 shadow-lg' : 'border-slate-100'} overflow-hidden hover:shadow-xl transition-all group flex flex-col ${className || ''}`}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(image.id);
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200'
                        : 'bg-white/40 backdrop-blur-md border-white/20 text-transparent hover:border-teal-400 group-hover:border-slate-300'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>

            <div className="bg-slate-100 relative overflow-hidden aspect-video flex">
                <img
                    src={image.url}
                    alt="Gallery"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDetails({
                            ...image,
                            title: image.name || 'Gallery Image',
                            description: `Size: ${(image.size / 1024).toFixed(2)} KB`
                        });
                    }}
                />
            </div>
            {/* <div className="p-3 bg-white border-t border-slate-50 flex justify-between items-center">
                <div className="flex flex-col text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    <span className="truncate max-w-[120px]">{image.name || image.title || 'Gallery Image'}</span>
                    <span>{(image.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(image);
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    title="Edit Image"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div> */}
        </div>
    );
};

export default ImageListing;
