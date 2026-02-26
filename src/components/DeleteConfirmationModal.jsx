import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, twoStep = false }) => {
    const [step, setStep] = React.useState(1);

    React.useEffect(() => {
        if (isOpen) setStep(1);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (twoStep && step === 1) {
            setStep(2);
        } else {
            onConfirm();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-slide-up">
                <div className="p-8 text-center text-wrap">
                    <div className={`w-20 h-20 ${step === 2 ? 'bg-orange-50' : 'bg-red-50'} rounded-full flex items-center justify-center mx-auto mb-6 transition-colors`}>
                        <span className="text-4xl">{step === 2 ? '❓' : '⚠️'}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {step === 2 ? 'Final Confirmation' : (title || 'Are you sure?')}
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {step === 2
                            ? 'This will permanently delete the folder and ALL items inside it. This cannot be undone!'
                            : (message || 'This action cannot be undone. Do you really want to delete this item?')}
                    </p>
                </div>

                <div className="flex border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                        {step === 2 ? 'Back' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-6 py-4 font-bold uppercase tracking-widest text-xs transition-colors ${step === 2 ? 'text-red-700 bg-red-50 hover:bg-red-100' : 'text-red-600 hover:bg-red-50'}`}
                    >
                        {step === 2 ? 'Yes, Delete Everything' : (twoStep ? 'Understand & Proceed' : 'Yes, Delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
