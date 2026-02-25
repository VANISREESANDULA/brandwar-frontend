import React, { useState, useEffect } from 'react';

const ClientForm = ({ initialData, onSubmit, loading, submitLoading, isEditMode, onCancel }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        websiteUrl: '',
        logo: '', // Store as base64 string
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        contactName: '',
        phoneNumber: '',
        address: '',
        email: '',
        password: '',
        startDate: '',
        endDate: '',
        moduleBlog: false,
        blogColor: '#3B82F6',
        moduleNews: false,
        newsColor: '#EF4444',
        moduleVideos: false,
        videosColor: '#8B5CF6',
        moduleImages: false,
        imagesColor: '#10B981',
        status: 'ACTIVE',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Format dates for input fields
            const formatDate = (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            };

            setFormData({
                companyName: initialData.companyName || '',
                websiteUrl: initialData.websiteUrl || '',
                logo: initialData.logo || '',
                primaryColor: initialData.primaryColor || '#3B82F6',
                secondaryColor: initialData.secondaryColor || '#8B5CF6',
                contactName: initialData.contactName || '',
                phoneNumber: initialData.phoneNumber || '',
                address: initialData.address || '',
                email: initialData.email || '',
                password: '', // Don't pre-fill password
                startDate: formatDate(initialData.startDate),
                endDate: formatDate(initialData.endDate),
                moduleBlog: initialData.moduleBlog || false,
                blogColor: initialData.blogColor || '#3B82F6',
                moduleNews: initialData.moduleNews || false,
                newsColor: initialData.newsColor || '#EF4444',
                moduleVideos: initialData.moduleVideos || false,
                videosColor: initialData.videosColor || '#8B5CF6',
                moduleImages: initialData.moduleImages || false,
                imagesColor: initialData.imagesColor || '#10B981',
                status: initialData.status || 'ACTIVE',
            });
        }
    }, [initialData]);

    const validateUrl = (url) => {
        return url && url.length > 0;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, logo: 'File size must be less than 2MB' }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
                setErrors(prev => ({ ...prev, logo: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!validateUrl(formData.websiteUrl)) {
            newErrors.websiteUrl = 'Website URL is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {errors.form}
                </div>
            )}

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Website URL *
                        </label>
                        <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleChange}
                            placeholder="https://www.example.com"
                            className={`input-field ${errors.websiteUrl ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.websiteUrl && (
                            <p className="text-red-600 text-sm mt-1">{errors.websiteUrl}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Primary Color *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="w-16 h-10 rounded border border-slate-300"
                            />
                            <input
                                type="text"
                                value={formData.primaryColor}
                                readOnly
                                className="input-field flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Secondary Color *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                name="secondaryColor"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                className="w-16 h-10 rounded border border-slate-300"
                            />
                            <input
                                type="text"
                                value={formData.secondaryColor}
                                readOnly
                                className="input-field flex-1"
                            />
                        </div>
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Company Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                            />
                            {formData.logo && (
                                <img src={formData.logo} alt="Logo preview" className="h-12 w-auto object-contain border bg-slate-200 rounded p-1" />
                            )}
                        </div>
                        {errors.logo && <p className="text-red-600 text-sm mt-1">{errors.logo}</p>}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Contact Name *
                        </label>
                        <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password {isEditMode ? '(Leave blank to keep current)' : '*'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pr-10"
                                required={!isEditMode}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                            rows="2"
                        />
                    </div>
                </div>
            </div>

            {/* Status */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Status</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="input-field"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="HOLD">Hold</option>
                    </select>
                </div>
            </div> */}


            {/* Service Period */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Service Period</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Start Date *
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            End Date *
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Modules & Colors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="moduleBlog"
                                checked={formData.moduleBlog}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-slate-900">Blog Module</label>
                        </div>
                        {formData.moduleBlog && (
                            <input
                                type="color"
                                name="blogColor"
                                value={formData.blogColor}
                                onChange={handleChange}
                                className="w-12 h-8 rounded border border-slate-300"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="moduleNews"
                                checked={formData.moduleNews}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-slate-900">News Module</label>
                        </div>
                        {formData.moduleNews && (
                            <input
                                type="color"
                                name="newsColor"
                                value={formData.newsColor}
                                onChange={handleChange}
                                className="w-12 h-8 rounded border border-slate-300"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="moduleVideos"
                                checked={formData.moduleVideos}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-slate-900">Videos Module</label>
                        </div>
                        {formData.moduleVideos && (
                            <input
                                type="color"
                                name="videosColor"
                                value={formData.videosColor}
                                onChange={handleChange}
                                className="w-12 h-8 rounded border border-slate-300"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="moduleImages"
                                checked={formData.moduleImages}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-slate-900">Images Module</label>
                        </div>
                        {formData.moduleImages && (
                            <input
                                type="color"
                                name="imagesColor"
                                value={formData.imagesColor}
                                onChange={handleChange}
                                className="w-12 h-8 rounded border border-slate-300"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 btn-primary"
                >
                    {submitLoading ? 'Saving...' : (isEditMode ? 'Update Client' : 'Create Client')}
                </button>
            </div>
        </form>
    );
};

export default ClientForm;
