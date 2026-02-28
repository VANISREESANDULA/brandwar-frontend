export const getValidImageUrl = (url) => {
    if (!url || url === "default-logo.png") return "/brandwar-01.png";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.includes('uploads')) {
        const cleanPath = url.split('uploads')[1].replace(/\\/g, '/');
        return `http://localhost:4000/uploads${cleanPath}`;
    }
    return `http://localhost:4000/uploads/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
};
