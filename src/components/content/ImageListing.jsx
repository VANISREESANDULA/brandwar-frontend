import React from 'react';

const ImageListing = ({ image, onDetails }) => {
    return (
        <div className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group cursor-zoom-in">
            <img
                src={image.url}
                alt="Gallery"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onClick={() => onDetails({
                    ...image,
                    title: 'Gallery Image',
                    description: `Size: ${(image.size / 1024).toFixed(2)} KB`
                })}
            />
        </div>
    );
};

export default ImageListing;
