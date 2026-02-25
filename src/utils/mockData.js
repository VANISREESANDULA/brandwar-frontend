// Mock data for development - Replace with actual API calls

export const mockUsers = [
  {
    id: '1',
    email: 'superadmin@brandwar.com',
    password: 'admin123', // In production, this should be hashed
    name: 'Super Admin',
    role: 'SUPERADMIN',
  },
  {
    id: '2',
    email: 'admin@brandwar.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN',
  },
];

export const mockClients = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    websiteUrl: 'https://www.techcorp.com',
    logo: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    contactName: 'John Doe',
    phoneNumber: '+1 234 567 8900',
    address: '123 Tech Street, Silicon Valley, CA',
    email: 'contact@techcorp.com',
    password: 'client123',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    moduleBlog: true,
    blogColor: '#3B82F6',
    moduleNews: true,
    newsColor: '#EF4444',
    moduleVideos: true,
    videosColor: '#8B5CF6',
    moduleImages: true,
    imagesColor: '#10B981',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    companyName: 'Creative Agency',
    websiteUrl: 'https://www.creativeagency.in',
    logo: null,
    primaryColor: '#EC4899',
    secondaryColor: '#F97316',
    contactName: 'Jane Smith',
    phoneNumber: '+1 234 567 8901',
    address: '456 Creative Ave, New York, NY',
    email: 'hello@creativeagency.in',
    password: 'client123',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    moduleBlog: true,
    blogColor: '#EC4899',
    moduleNews: false,
    newsColor: null,
    moduleVideos: true,
    videosColor: '#F97316',
    moduleImages: true,
    imagesColor: '#06B6D4',
    status: 'ACTIVE',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    companyName: 'Digital Marketing Pro',
    websiteUrl: 'https://www.digitalmarketingpro.com',
    logo: null,
    primaryColor: '#10B981',
    secondaryColor: '#06B6D4',
    contactName: 'Mike Johnson',
    phoneNumber: '+1 234 567 8902',
    address: '789 Marketing Blvd, Los Angeles, CA',
    email: 'info@digitalmarketingpro.com',
    password: 'client123',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    moduleBlog: true,
    blogColor: '#10B981',
    moduleNews: true,
    newsColor: '#F59E0B',
    moduleVideos: false,
    videosColor: null,
    moduleImages: true,
    imagesColor: '#06B6D4',
    status: 'HOLD',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    companyName: 'Startup Innovations',
    websiteUrl: 'https://www.startupinnovations.com',
    logo: null,
    primaryColor: '#F59E0B',
    secondaryColor: '#EF4444',
    contactName: 'Sarah Williams',
    phoneNumber: '+1 234 567 8903',
    address: '321 Innovation Drive, Austin, TX',
    email: 'contact@startupinnovations.com',
    password: 'client123',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2024-01-31'),
    moduleBlog: false,
    blogColor: null,
    moduleNews: true,
    newsColor: '#EF4444',
    moduleVideos: true,
    videosColor: '#8B5CF6',
    moduleImages: true,
    imagesColor: '#F59E0B',
    status: 'INACTIVE',
    createdAt: new Date('2023-12-01'),
  },
];

export const mockBlogs = [
  { id: '1', clientId: '1', title: 'Introduction to AI', content: 'AI is transforming...', author: 'John Doe', publishedAt: new Date() },
  { id: '2', clientId: '1', title: 'Future of Technology', content: 'The future is bright...', author: 'Jane Smith', publishedAt: new Date() },
];

export const mockNews = [
  { id: '1', clientId: '2', title: 'Company Announcement', content: 'We are excited to announce...', publishedAt: new Date() },
];

export const mockVideos = [
  { id: '1', clientId: '2', title: 'Product Demo', url: 'https://youtube.com/watch?v=example', thumbnail: null, description: 'Product overview' },
];

export const mockImages = [
  { id: '1', clientId: '3', title: 'Office Building', url: '/images/office.jpg', description: 'Our new office' },
];

// Helper functions
export const authenticateUser = (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const getClientById = (id) => {
  return mockClients.find(c => c.id === id);
};

export const getClientsWithFilters = (search = '', status = null, page = 1, limit = 10) => {
  let filtered = mockClients;

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.companyName.toLowerCase().includes(searchLower) ||
        c.websiteUrl.toLowerCase().includes(searchLower) ||
        c.phoneNumber.includes(searchLower)
    );
  }

  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedClients = filtered.slice(startIndex, endIndex);

  return {
    clients: paginatedClients,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getStatistics = () => {
  const totalClients = mockClients.length;
  const activeClients = mockClients.filter(c => c.status === 'ACTIVE').length;
  const inactiveClients = mockClients.filter(c => c.status === 'INACTIVE').length;
  const holdClients = mockClients.filter(c => c.status === 'HOLD').length;
  
  const totalBlogs = mockBlogs.length;
  const totalNews = mockNews.length;
  const totalVideos = mockVideos.length;
  const totalImages = mockImages.length;
  const totalContent = totalBlogs + totalNews + totalVideos + totalImages;

  return {
    totalClients,
    activeClients,
    inactiveClients,
    holdClients,
    totalContent,
    totalBlogs,
    totalNews,
    totalVideos,
    totalImages,
  };
};

export const deleteClient = (id) => {
  const index = mockClients.findIndex(c => c.id === id);
  if (index > -1) {
    mockClients.splice(index, 1);
    return true;
  }
  return false;
};

export const updateClient = (id, data) => {
  const index = mockClients.findIndex(c => c.id === id);
  if (index > -1) {
    mockClients[index] = { ...mockClients[index], ...data, updatedAt: new Date() };
    return mockClients[index];
  }
  return null;
};

export const createClient = (data) => {
  const newClient = {
    id: String(mockClients.length + 1),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockClients.push(newClient);
  return newClient;
};
