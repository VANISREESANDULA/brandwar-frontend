import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-slide-up">
                <div className="p-8 text-center text-wrap">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {title || 'Are you sure?'}
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {message || 'This action cannot be undone. Do you really want to delete this item?'}
                    </p>
                </div>

                <div className="flex border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-6 py-4 text-red-600 font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-colors"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
