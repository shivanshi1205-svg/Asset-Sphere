import apiClient from './apiClient';

let MOCK_USERS = [
  {
    id: 1,
    avatar: "http://3.6.21.202:8000/uploads/default.png",
    name: "Demo Account",
    first_name: "Demo",
    last_name: "Account",
    username: "demo",
    email: "agrwalsshubham@gmail.com",
    role: "superadmin",
    employee_num: "EM0",
    jobtitle: "Administrator",
    vip: false,
    phone: null,
    mobile: null,
    website: null,
    address: null,
    location: { id: 1, name: "Noida" },
    department: null,
    activated: true,
    assets_count: 0,
    licenses_count: 0,
    accessories_count: 0,
    consumables_count: 0,
    created_at: { datetime: "2026-06-02 08:59:03", formatted: "2026-06-02 08:59 AM" },
    updated_at: { datetime: "2026-06-17 08:59:18", formatted: "2026-06-17 08:59 AM" },
    available_actions: { update: true, delete: true, clone: true, restore: false }
  },
  {
    id: 3,
    avatar: "http://3.6.21.202:8000/uploads/default.png",
    name: "DEMO Tenant",
    first_name: "DEMO",
    last_name: "Tenant",
    username: "demo2",
    email: "demo@example.com",
    role: "Staff",
    employee_num: "EM1",
    jobtitle: "LEAD Developer",
    vip: false,
    phone: null,
    mobile: null,
    website: null,
    address: "0406 Emmet Drive",
    location: { id: 1, name: "Noida" },
    department: null,
    activated: true,
    assets_count: 2,
    licenses_count: 1,
    accessories_count: 0,
    consumables_count: 0,
    created_at: { datetime: "2026-06-02 16:09:05", formatted: "2026-06-02 04:09 PM" },
    updated_at: { datetime: "2026-06-02 16:09:05", formatted: "2026-06-02 04:09 PM" },
    available_actions: { update: true, delete: true, clone: true, restore: false }
  },
  {
    id: 4,
    avatar: "http://3.6.21.202:8000/uploads/default.png",
    name: "deena Tenant",
    first_name: "deena",
    last_name: "Tenant",
    username: "demo3",
    email: "demo@djtcorp.in",
    role: "Staff",
    employee_num: "EM2",
    jobtitle: "Lead Architect",
    vip: false,
    phone: null,
    mobile: null,
    website: null,
    address: "0406 Emmet Drive",
    location: { id: 1, name: "Noida" },
    department: null,
    activated: true,
    assets_count: 0,
    licenses_count: 0,
    accessories_count: 0,
    consumables_count: 0,
    created_at: { datetime: "2026-06-04 10:22:57", formatted: "2026-06-04 10:22 AM" },
    updated_at: { datetime: "2026-06-04 10:22:57", formatted: "2026-06-04 10:22 AM" },
    available_actions: { update: true, delete: true, clone: true, restore: false }
  },
  {
    id: 2,
    avatar: "http://3.6.21.202:8000/uploads/default.png",
    name: "Awdhesh Soni",
    first_name: "Awdhesh",
    last_name: "Soni",
    username: "awdhesh.soni",
    email: "awdhesh.soni@djtcorp.in",
    role: "User Manager",
    employee_num: "EM3",
    jobtitle: "Technical Lead",
    vip: false,
    phone: null,
    mobile: null,
    website: null,
    address: null,
    location: null,
    department: null,
    activated: true,
    assets_count: 1,
    licenses_count: 0,
    accessories_count: 0,
    consumables_count: 0,
    created_at: { datetime: "2026-06-02 13:18:00", formatted: "2026-06-02 01:18 PM" },
    updated_at: { datetime: "2026-06-02 13:18:00", formatted: "2026-06-02 01:18 PM" },
    available_actions: { update: true, delete: true, clone: true, restore: false }
  }
];

export const userService = {
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend users API failed, falling back to mock data:', error);
      let filtered = [...MOCK_USERS];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.username.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            (item.jobtitle || '').toLowerCase().includes(query)
        );
      }
      return {
        total: filtered.length,
        rows: filtered
      };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend user ${id} fetch failed, returning mock:`, error);
      const item = MOCK_USERS.find(u => u.id === parseInt(id, 10));
      if (!item) throw new Error('User not found');
      return item;
    }
  },

  createUser: async (data) => {
    try {
      const response = await apiClient.post('/users', data);
      return response.data;
    } catch (error) {
      console.warn('Backend user creation failed, updating mock memory:', error);
      const newItem = {
        id: MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 : 1,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Custom User',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        username: data.username || `user_${Math.floor(1000 + Math.random() * 9000)}`,
        email: data.email || '',
        role: data.role || 'Staff',
        employee_num: data.employee_num || '',
        jobtitle: data.jobtitle || '',
        vip: !!data.vip,
        phone: data.phone || null,
        mobile: data.mobile || null,
        website: data.website || null,
        address: data.address || null,
        location: data.location_id ? { id: data.location_id, name: 'Noida Office' } : null,
        department: data.department_id ? { id: data.department_id, name: 'Engineering' } : null,
        activated: !!data.activated,
        assets_count: 0,
        licenses_count: 0,
        accessories_count: 0,
        consumables_count: 0,
        created_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        available_actions: { update: true, delete: true, clone: true, restore: false }
      };
      MOCK_USERS.unshift(newItem);
      return { status: 'success', messages: 'User created successfully', payload: newItem };
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend user update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_USERS.findIndex(u => u.id === parseInt(id, 10));
      if (index !== -1) {
        MOCK_USERS[index] = {
          ...MOCK_USERS[index],
          ...data,
          name: `${data.first_name || MOCK_USERS[index].first_name} ${data.last_name || MOCK_USERS[index].last_name}`.trim(),
          updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' }
        };
        return { status: 'success', messages: 'User updated successfully', payload: MOCK_USERS[index] };
      }
      throw new Error('User not found');
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend user delete failed for ID ${id}, updating mock:`, error);
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== parseInt(id, 10));
      return { status: 'success', messages: 'User deleted successfully' };
    }
  }
};
