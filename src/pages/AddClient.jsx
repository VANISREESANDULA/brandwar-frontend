import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';
import ClientForm from '../components/ClientForm';

const AddClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Load client data in edit mode
  useEffect(() => {
    const fetchClient = async () => {
      if (isEditMode) {
        try {
          // Since /admins/:id does not exist, we fetch all and find the client locally
          const response = await api.get('/admins');
          const clientData = response.data.find(c => c.id === id);

          if (clientData) {
            // Map snake_case to camelCase
            const mappedData = {
              ...clientData,
              companyName: clientData.company_name,
              websiteUrl: clientData.website,
              contactName: clientData.name,
              phoneNumber: clientData.contact_number,
              primaryColor: clientData.primary_color,
              secondaryColor: clientData.secondary_color,
              logo: clientData.logo,
              status: clientData.isActive ? 'ACTIVE' : 'INACTIVE',
              moduleBlog: clientData.allowBlogs,
              moduleNews: clientData.allowNews,
              moduleVideos: clientData.allowVideos,
              moduleImages: clientData.allowImages,
            };
            setInitialData(mappedData);
          } else {
            console.error("Client not found in the list");
            navigate('/clients');
          }
        } catch (error) {
          console.error("Failed to fetch client:", error);
          navigate('/clients');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClient();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);

    try {
      const isActive = formData.status === 'ACTIVE';

      const payload = new FormData();
      payload.append('isActive', isActive);
      payload.append('company_name', formData.companyName || '');
      payload.append('website', formData.websiteUrl || '');
      payload.append('name', formData.contactName || '');
      payload.append('contact_number', formData.phoneNumber || '');
      payload.append('primary_color', formData.primaryColor || '');
      payload.append('secondary_color', formData.secondaryColor || '');
      payload.append('email', formData.email || '');
      payload.append('address', formData.address || '');

      if (formData.password) {
        payload.append('password', formData.password);
      }

      if (formData.logoFile) {
        payload.append('logo', formData.logoFile);
      }

      payload.append('allowBlogs', !!formData.moduleBlog);
      payload.append('allowNews', !!formData.moduleNews);
      payload.append('allowVideos', !!formData.moduleVideos);
      payload.append('allowImages', !!formData.moduleImages);

      if (formData.startDate) payload.append('startDate', formData.startDate);
      if (formData.endDate) payload.append('endDate', formData.endDate);

      console.log('Sending payload:', Array.from(payload.entries()));

      if (isEditMode) {
        // Backend uses /admins/:id/update for PUT
        await api.put(`/admins/${id}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToast({ message: 'Client updated successfully!', type: 'success' });
      } else {
        await api.post('/admins', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToast({ message: 'Client created successfully!', type: 'success' });
      }

      setTimeout(() => {
        navigate('/clients');
      }, 1500);

    } catch (error) {
      console.error("Error saving client:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to save client. Please try again.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/clients" className="hover:text-blue-600 transition-colors">Clients</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{isEditMode ? 'Edit Client' : 'Add Client'}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEditMode ? 'Edit Client' : 'Add New Client'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isEditMode ? 'Update the client details below' : 'Fill in the details to create a new client account'}
        </p>
      </div>

      <ClientForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
        submitLoading={submitLoading}
        isEditMode={isEditMode}
        onCancel={() => navigate('/clients')}
      />
    </div>
  );
};

export default AddClient;
