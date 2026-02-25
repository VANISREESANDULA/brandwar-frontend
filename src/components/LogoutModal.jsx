import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-slate-100">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Confirm Logout</h3>
                            <p className="text-sm text-slate-500">End your current session</p>
                        </div>
                    </div>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Are you sure you want to sign out of your account? You will need to login again to access your dashboard.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                        >
                            No, Stay
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Yes, Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
