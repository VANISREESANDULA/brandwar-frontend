import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { slugify } from '../utils/slugify';
import { useAuth } from '../contexts/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Toast from '../components/Toast';
import EditItemModal from '../components/EditItemModal';
import CreateVideoModal from '../components/CreateVideoModal';
import CreateImageModal from '../components/CreateImageModal';
import { useDragSelect } from '../hooks/useDragSelect';
import VideoListing from '../components/content/VideoListing';
import ImageListing from '../components/content/ImageListing';

const GalleryFolderPage = () => {
    const { companySlug, type, folderId, folderTitle } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folderData, setFolderData] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [projectFilter, setProjectFilter] = useState('');
    const [selectedProject, setSelectedProject] = useState('All');

    // Extract unique project names for dropdowns and tabs - Robust and case-insensitive
    const existingProjects = Array.from(new Set(
        items
            .filter(item => type?.toLowerCase() === 'videos')
            .map(item => item.project_name?.trim())
            .filter(Boolean)
    ));

    // Determine if this is a project folder using param as primary source
    const isProjectFolder = (folderTitle || folderData?.title || '')?.toLowerCase()?.includes('project');

    const filteredItems = items.filter(item => {
        const itemType = type?.toLowerCase();

        // Search filter
        const matchesSearch = !projectFilter ||
            item.project_name?.toLowerCase().includes(projectFilter.trim().toLowerCase()) ||
            item.title?.toLowerCase().includes(projectFilter.trim().toLowerCase());

        // Tab filter - Robust with trimming and case-insensitive comparison
        const matchesTab = !isProjectFolder || itemType !== 'videos' || selectedProject === 'All' ||
            item.project_name?.trim().toLowerCase() === selectedProject.toLowerCase();

        return matchesSearch && matchesTab;
    });

    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isTwoStepDelete, setIsTwoStepDelete] = useState(false);

    const { onMouseDown, onMouseMove, selectionBox, isDragging } = useDragSelect({
        items: filteredItems,
        selectedIds,
        setSelectedIds,
        itemClassName: 'selectable-item'
    });
    const { user, isSuperAdmin } = useAuth();

    const getValidImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        if (url.includes("uploads")) {
            const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
            return `http://localhost:4000/uploads${cleanPath}`;
        }
        return `http://localhost:4000/uploads/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";
        if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
        } else if (url.includes("embed/")) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const fetchItems = async () => {
        try {
            let client;
            if (isSuperAdmin) {
                const adminsResponse = await api.get('/admins');
                client = adminsResponse.data.find(c => slugify(c.company_name) === companySlug);
            } else {
                client = user;
            }

            if (!client) {
                setItems([]);
                setLoading(false);
                return;
            }

            const folderEndpoint = type === 'images' ? `/imagefolders/${folderId}` : `/videofolders/${folderId}`;
            const folderResponse = await api.get(folderEndpoint);
            setFolderData(folderResponse.data);

            const itemsEndpoint = type === 'videos' ? `/videofolders/${folderId}/` : `/imagefolders/${folderId}/`;
            const itemsResponse = await api.get(itemsEndpoint);
            setItems(itemsResponse.data);
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [companySlug, type, folderId]);

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsTwoStepDelete(false);
        setIsDeleteModalOpen(true);
    };

    const handleEditClick = (item) => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setItemToDelete({ id: 'bulk' });
        setIsTwoStepDelete(true);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.id === 'bulk') {
                setIsBulkDeleting(true);
                let completedCount = 0;
                for (const id of selectedIds) {
                    const endpoint = type === 'videos'
                        ? `/videofolders/videos/${id}`
                        : `/imagefolders/images/${id}`;
                    await api.delete(endpoint);
                    completedCount++;
                }
                setToast({ message: `Successfully deleted ${completedCount} items`, type: 'success' });
                setSelectedIds([]);
            } else {
                const endpoint = type === 'videos'
                    ? `/videofolders/videos/${itemToDelete.id}`
                    : `/imagefolders/images/${itemToDelete.id}`;
                await api.delete(endpoint);
                setToast({ message: 'Deleted successfully', type: 'success' });
            }
            fetchItems();
        } catch (error) {
            console.error("Delete failed:", error);
            setToast({ message: 'Failed to delete some items', type: 'error' });
        } finally {
            setIsBulkDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!folderData) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 md:px-8 py-10">
            <div className="w-full space-y-12">
                <div className="flex flex-col gap-6 mb-12">
                    <button
                        onClick={() => navigate(`/${companySlug}/gallery/${type}`)}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-black text-[10px] uppercase tracking-[0.2em] w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Gallery
                    </button>

                    <div className="flex items-center justify-between gap-8">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase drop-shadow-sm">
                            {folderData?.title || folderTitle}
                        </h1>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`flex items-center gap-3 px-6 py-3 ${type === 'videos' ? 'bg-purple-600 shadow-purple-200' : 'bg-teal-600 shadow-teal-200'} text-white rounded-xl text-[10px] font-black hover:scale-105 hover:shadow-2xl transition-all shadow-xl uppercase tracking-[0.2em] group`}
                        >
                            <span className="text-md group-hover:rotate-90 transition-transform">➕</span>
                            Add {type === 'videos' ? 'Video' : 'Image'}
                        </button>
                    </div>
                </div>

                {/* Project Tabs - Public Style Mirror */}
                {type?.toLowerCase() === 'videos' && isProjectFolder && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-16 px-4">
                        <button
                            onClick={() => setSelectedProject('All')}
                            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border-2 ${selectedProject === 'All'
                                ? 'bg-[#004a99] text-white border-[#004a99] shadow-lg shadow-blue-100'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-[#004a99] hover:text-[#004a99]'
                                }`}
                        >
                            All
                        </button>
                        {existingProjects.map((project) => (
                            <button
                                key={project}
                                onClick={() => setSelectedProject(project)}
                                className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border-2 ${selectedProject === project
                                    ? 'bg-[#004a99] text-white border-[#004a99] shadow-lg shadow-blue-100'
                                    : 'bg-white text-[#004a99] border-[#004a99] hover:bg-[#004a99] hover:text-white'
                                    }`}
                            >
                                {project}
                            </button>
                        ))}
                    </div>
                )}

                {/* Filter Bar for Projects */}
                {type === 'videos' && isProjectFolder && (
                    <div className="w-full max-w-md bg-white p-2 rounded-2xl border border-slate-200 flex items-center shadow-sm -mt-4 mb-4">
                        <svg className="w-5 h-5 text-slate-400 ml-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search by project or title..."
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none py-2"
                        />
                        {projectFilter && (
                            <button onClick={() => setProjectFilter('')} className="p-2 text-slate-400 hover:text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 animate-slide-up sticky top-4 z-[90] mb-8 mx-4">
                        <div className="flex items-center gap-6">
                            <div className={`px-4 py-2 ${type === 'videos' ? 'bg-purple-600' : 'bg-teal-600'} text-white rounded-xl text-xs font-black tracking-widest uppercase`}>
                                {selectedIds.length} SELECTED
                            </div>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest"
                            >
                                Clear All
                            </button>
                        </div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} ${type}`}
                        </button>
                    </div>
                )}

                {/* Virtual Tour Header for Project Selection */}
                {type?.toLowerCase() === 'videos' && isProjectFolder && (
                    <div className="text-center mb-16 animate-slide-up bg-white py-4">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-widest mb-3">
                            {selectedProject === 'All' ? (folderTitle || folderData?.title) : `${selectedProject}`} VIRTUAL TOUR
                        </h2>
                        <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
                    </div>
                )}

                {/* Custom 2,3,4 Grid Layout - Masonry Style */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 relative w-full"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                >
                    {isDragging && selectionBox && (
                        <div
                            className="fixed border-2 border-teal-500/50 bg-teal-500/10 pointer-events-none z-[1000] rounded-lg"
                            style={{
                                top: selectionBox.top,
                                left: selectionBox.left,
                                width: selectionBox.width,
                                height: selectionBox.height
                            }}
                        />
                    )}
                    {filteredItems?.map((item) => (
                        <div key={item.id} className="selectable-item">
                            {type === 'videos' ? (
                                <VideoListing
                                    video={item}
                                    folder={folderData}
                                    onEdit={handleEditClick}
                                    isSelected={selectedIds.includes(item.id)}
                                    onSelect={toggleSelection}
                                />
                            ) : (
                                <ImageListing
                                    image={{
                                        ...item,
                                        url: getValidImageUrl(item.url)
                                    }}
                                    onDetails={setItemToEdit}
                                    onEdit={handleEditClick}
                                    isSelected={selectedIds.includes(item.id)}
                                    onSelect={toggleSelection}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {filteredItems?.length === 0 && (
                    <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-100">
                        <p className="text-slate-300 font-black text-xs uppercase tracking-[0.3em]">
                            {projectFilter ? 'No items match your filter' : 'Vault is empty'}
                        </p>
                    </div>
                )}
            </div>

            {type === 'videos' ? (
                <CreateVideoModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    folderId={folderId}
                    folderTitle={folderTitle || folderData?.title}
                    onSuccess={() => {
                        setToast({ message: 'Video added successfully', type: 'success' });
                        fetchItems();
                    }}
                    existingProjects={existingProjects}
                />
            ) : (
                <CreateImageModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    folderId={folderId}
                    onSuccess={() => {
                        setToast({ message: 'Image uploaded successfully', type: 'success' });
                        fetchItems();
                    }}
                />
            )}

            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={async () => {
                    setToast({ message: 'Item updated successfully', type: 'success' });
                    fetchItems();
                }}
                item={itemToEdit}
                type={type}
                folderTitle={folderTitle || folderData?.title}
                existingProjects={existingProjects}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={itemToDelete?.id === 'bulk' ? `Bulk Delete ${type.charAt(0).toUpperCase() + type.slice(1)}?` : `Delete ${type.slice(0, -1)}?`}
                message={itemToDelete?.id === 'bulk'
                    ? `Are you sure you want to delete ${selectedIds.length} items?`
                    : `Are you sure you want to delete this ${type.slice(0, -1)}?`}
                twoStep={isTwoStepDelete}
                step1Message={{
                    title: 'Delete Confirmation',
                    text: 'Do you really want to delete?',
                    buttonText: 'Yes, Proceed'
                }}
                step2Message={{
                    title: 'Warning: Action Irreversible',
                    text: 'If you delete this, you cannot restore the items. Do you still want to proceed?',
                    buttonText: 'Yes, Delete Permanently'
                }}
            />

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
        </div>
    );
};

export default GalleryFolderPage;
