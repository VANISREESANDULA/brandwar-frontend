import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BlogListing = ({ item, onEdit, onDelete, getValidImageUrl }) => {
    const { companySlug } = useParams();
    const imageBlock = item.contents?.find(c => c.type === "image");
    const imageUrl = imageBlock ? getValidImageUrl(imageBlock.content) : null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
                        📝
                    </div>
                )}
            </div>

            <div className="p-5">
                <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {item.title}
                </h4>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {item.description}
                </p>
                <div className="flex gap-2">
                    <Link
                        to={`/${companySlug}/blogs/${item.slug}`}
                        className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                    >
                        Details
                    </Link>
                    <button
                        onClick={() => onEdit(item)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="px-3 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                        Del
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogListing;
