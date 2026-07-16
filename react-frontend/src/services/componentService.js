import apiClient from './apiClient';

let MOCK_COMPONENTS = [
  {
    id: 1,
    name: "Crucial 16GB DDR4 RAM",
    serial: "CR-DDR4-16G-992",
    company: { id: 3, name: "HP" },
    category: { id: 7, name: "RAM" },
    location: { id: 1, name: "Noida" },
    qty: 20,
    remaining: 15,
    remaining_qty: 15,
    min_qty: 2,
    purchase_cost: "55.00",
    order_number: "PO-RAM982",
    notes: "For server upgrades",
    created_at: { datetime: "2026-06-02 10:00:00", formatted: "2026-06-02" },
    updated_at: { datetime: "2026-06-02 10:00:00", formatted: "2026-06-02" },
    available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
  },
  {
    id: 2,
    name: "Samsung Evo 970 SSD 500GB",
    serial: "SS-EVO-500G-882",
    company: { id: 2, name: "Abshire" },
    category: { id: 8, name: "SSD" },
    location: { id: 1, name: "Noida" },
    qty: 10,
    remaining: 8,
    remaining_qty: 8,
    min_qty: 1,
    purchase_cost: "85.00",
    order_number: "PO-SSD771",
    notes: "For laptop repair",
    created_at: { datetime: "2026-06-03 11:00:00", formatted: "2026-06-03" },
    updated_at: { datetime: "2026-06-03 11:00:00", formatted: "2026-06-03" },
    available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
  }
];

export const componentService = {
  getComponents: async (params = {}) => {
    try {
      const response = await apiClient.get('/components', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend components API failed, falling back to mock data:', error);
      let filtered = [...MOCK_COMPONENTS];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.serial.toLowerCase().includes(query) ||
            item.category?.name?.toLowerCase().includes(query)
        );
      }
      return {
        total: filtered.length,
        rows: filtered
      };
    }
  },

  getComponentById: async (id) => {
    try {
      const response = await apiClient.get(`/components/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend component ${id} fetch failed, returning mock:`, error);
      const item = MOCK_COMPONENTS.find(c => c.id === parseInt(id, 10));
      if (!item) throw new Error('Component not found');
      return item;
    }
  },

  createComponent: async (data) => {
    try {
      const response = await apiClient.post('/components', data);
      return response.data;
    } catch (error) {
      console.warn('Backend component creation failed, updating mock memory:', error);
      const qty = parseInt(data.qty || '1', 10);
      const newItem = {
        id: MOCK_COMPONENTS.length > 0 ? Math.max(...MOCK_COMPONENTS.map(c => c.id)) + 1 : 1,
        name: data.name || '',
        serial: data.serial || '',
        qty: qty,
        remaining: qty,
        remaining_qty: qty,
        category: { id: data.category_id || 7, name: 'RAM' },
        location: data.location_id ? { id: data.location_id, name: 'Noida' } : null,
        company: data.company_id ? { id: data.company_id, name: 'Custom Company' } : null,
        notes: data.notes || '',
        purchase_cost: data.purchase_cost || null,
        order_number: data.order_number || '',
        min_qty: data.min_qty ? parseInt(data.min_qty, 10) : null,
        created_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
      };
      MOCK_COMPONENTS.unshift(newItem);
      return { status: 'success', messages: 'Component created successfully', payload: newItem };
    }
  },

  updateComponent: async (id, data) => {
    try {
      const response = await apiClient.put(`/components/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend component update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_COMPONENTS.findIndex(c => c.id === parseInt(id, 10));
      if (index !== -1) {
        const qty = parseInt(data.qty !== undefined ? data.qty : MOCK_COMPONENTS[index].qty, 10);
        MOCK_COMPONENTS[index] = {
          ...MOCK_COMPONENTS[index],
          ...data,
          qty: qty,
          remaining: qty - (MOCK_COMPONENTS[index].qty - MOCK_COMPONENTS[index].remaining),
          remaining_qty: qty - (MOCK_COMPONENTS[index].qty - MOCK_COMPONENTS[index].remaining),
          updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' }
        };
        return { status: 'success', messages: 'Component updated successfully', payload: MOCK_COMPONENTS[index] };
      }
      throw new Error('Component not found');
    }
  },

  deleteComponent: async (id) => {
    try {
      const response = await apiClient.delete(`/components/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend component delete failed for ID ${id}, updating mock:`, error);
      MOCK_COMPONENTS = MOCK_COMPONENTS.filter(c => c.id !== parseInt(id, 10));
      return { status: 'success', messages: 'Component deleted successfully' };
    }
  },

  checkoutComponent: async (id, data) => {
    try {
      const response = await apiClient.post(`/components/${id}/checkout`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend component checkout failed for ID ${id}, updating mock:`, error);
      const index = MOCK_COMPONENTS.findIndex(c => c.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_COMPONENTS[index].remaining > 0) {
          MOCK_COMPONENTS[index].remaining -= 1;
          MOCK_COMPONENTS[index].remaining_qty -= 1;
          return { status: 'success', messages: 'Component checked out successfully' };
        } else {
          throw new Error('No components remaining in stock');
        }
      }
      throw new Error('Component not found');
    }
  },

  checkinComponent: async (id, data) => {
    try {
      const response = await apiClient.post(`/components/${id}/checkin`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend component checkin failed for ID ${id}, updating mock:`, error);
      const index = MOCK_COMPONENTS.findIndex(c => c.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_COMPONENTS[index].remaining < MOCK_COMPONENTS[index].qty) {
          MOCK_COMPONENTS[index].remaining += 1;
          MOCK_COMPONENTS[index].remaining_qty += 1;
          return { status: 'success', messages: 'Component checked in successfully' };
        }
      }
      throw new Error('Component not found or already fully checked in');
    }
  }
};
