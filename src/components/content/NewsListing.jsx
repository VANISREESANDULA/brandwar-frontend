import React from 'react';
import { Link, useParams } from 'react-router-dom';

const NewsListing = ({ item, onEdit, onDelete, getValidImageUrl, isSelected, onSelect, className }) => {
    const { companySlug } = useParams();
    const imageBlock = item.contents?.find(c => c.type === "image");
    const imageUrl = imageBlock ? getValidImageUrl(imageBlock.content) : null;

    return (
        <div
            data-id={item.id}
            className={`selectable-item relative bg-white rounded-2xl shadow-sm border ${isSelected ? 'border-red-500 ring-4 ring-red-100 shadow-lg' : 'border-slate-100'} overflow-hidden hover:shadow-xl transition-all group flex flex-col ${className || ''}`}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.id);
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                        : 'bg-white/80 backdrop-blur-md border-white/50 text-transparent hover:border-red-400 group-hover:border-slate-300'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>

            <div className="bg-slate-100 relative overflow-hidden aspect-video">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
                        📰
                    </div>
                )}
            </div>

            <div className="p-5">
                <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {item.title}
                </h4>
                {/* <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {item.description}
                </p> */}
                <div className="flex items-center gap-2 mt-2">
                    <Link
                        to={`/${companySlug}/news/${item.slug}`}
                        className="px-10 py-2.5 rounded-full border border-red-200 bg-red-600 text-white hover:bg-red-50 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                        Details
                    </Link>
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm bg-white"
                        title="Edit News"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsListing;
