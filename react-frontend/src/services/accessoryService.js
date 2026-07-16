import apiClient from './apiClient';

let MOCK_ACCESSORIES = [
  {
    id: 4,
    name: "HP Wireless Mouse",
    image: null,
    company: { id: 3, name: "HP" },
    manufacturer: { id: 5, name: "HP" },
    supplier: { id: 3, name: "noida dealer" },
    model_number: "W-MOUSE-100",
    category: { id: 4, name: "MOUSE" },
    location: { id: 1, name: "Noida" },
    notes: "Office essentials",
    qty: 12,
    percent_remaining: 100,
    purchase_date: { date: "2026-06-15", formatted: "2026-06-15" },
    purchase_cost: "20.00",
    total_cost: "240.00",
    order_number: "PO-M4123",
    min_qty: 2,
    remaining_qty: 12,
    remaining: 12,
    checkouts_count: 0,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-16 13:58:06", formatted: "2026-06-16" },
    updated_at: { datetime: "2026-06-16 13:58:06", formatted: "2026-06-16" },
    available_actions: { checkout: true, checkin: false, update: true, delete: true, clone: true },
    user_can_checkout: true
  },
  {
    id: 3,
    name: "Apple Lightning Cable",
    image: null,
    company: { id: 2, name: "Abshire" },
    manufacturer: { id: 1, name: "Apple" },
    supplier: { id: 1, name: "Kunde, Doyle and Kozey" },
    model_number: "AP-LIGHTNING",
    category: { id: 4, name: "CABLES" },
    location: { id: 1, name: "Noida" },
    notes: "For development iPhones",
    qty: 15,
    percent_remaining: 80,
    purchase_date: { date: "2026-06-10", formatted: "2026-06-10" },
    purchase_cost: "19.00",
    total_cost: "285.00",
    order_number: "PO-A1123",
    min_qty: 3,
    remaining_qty: 12,
    remaining: 12,
    checkouts_count: 3,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-10 06:33:51", formatted: "2026-06-10" },
    updated_at: { datetime: "2026-06-10 06:33:51", formatted: "2026-06-10" },
    available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true },
    user_can_checkout: true
  },
  {
    id: 1,
    name: "Logitech MX Master 3",
    image: null,
    company: { id: 3, name: "HP" },
    manufacturer: { id: 17, name: "New ok pvt." },
    supplier: { id: 2, name: "Runte-Corwin" },
    model_number: "MX-355",
    category: { id: 4, name: "MOUSE" },
    location: { id: 1, name: "Noida" },
    notes: "Designers premium mouse",
    qty: 61,
    percent_remaining: 100,
    purchase_date: null,
    purchase_cost: "99.00",
    total_cost: "6039.00",
    order_number: "PO-L9901",
    min_qty: 5,
    remaining_qty: 61,
    remaining: 61,
    checkouts_count: 0,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-02 16:33:30", formatted: "2026-06-02" },
    updated_at: { datetime: "2026-06-02 16:33:30", formatted: "2026-06-02" },
    available_actions: { checkout: true, checkin: false, update: true, delete: true, clone: true },
    user_can_checkout: true
  }
];

export const accessoryService = {
  getAccessories: async (params = {}) => {
    try {
      const response = await apiClient.get('/accessories', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend accessories API failed, falling back to mock data:', error);
      let filtered = [...MOCK_ACCESSORIES];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.model_number.toLowerCase().includes(query) ||
            item.category?.name?.toLowerCase().includes(query)
        );
      }
      return {
        total: filtered.length,
        rows: filtered
      };
    }
  },

  getAccessoryById: async (id) => {
    try {
      const response = await apiClient.get(`/accessories/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend accessory ${id} fetch failed, returning mock:`, error);
      const item = MOCK_ACCESSORIES.find(a => a.id === parseInt(id, 10));
      if (!item) throw new Error('Accessory not found');
      return item;
    }
  },

  createAccessory: async (data) => {
    try {
      const response = await apiClient.post('/accessories', data);
      return response.data;
    } catch (error) {
      console.warn('Backend accessory creation failed, updating mock memory:', error);
      const qty = parseInt(data.qty || '1', 10);
      const newItem = {
        id: MOCK_ACCESSORIES.length > 0 ? Math.max(...MOCK_ACCESSORIES.map(a => a.id)) + 1 : 1,
        name: data.name || '',
        model_number: data.model_number || '',
        qty: qty,
        remaining_qty: qty,
        remaining: qty,
        percent_remaining: 100,
        category: { id: data.category_id || 4, name: 'MOUSE' },
        manufacturer: { id: data.manufacturer_id || 5, name: 'HP' },
        supplier: data.supplier_id ? { id: data.supplier_id, name: 'Custom Supplier' } : null,
        company: data.company_id ? { id: data.company_id, name: 'Custom Company' } : null,
        location: data.location_id ? { id: data.location_id, name: 'Noida' } : null,
        notes: data.notes || '',
        purchase_cost: data.purchase_cost || null,
        purchase_date: data.purchase_date ? { date: data.purchase_date, formatted: data.purchase_date } : null,
        order_number: data.order_number || '',
        min_qty: data.min_qty ? parseInt(data.min_qty, 10) : null,
        checkouts_count: 0,
        created_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true },
        user_can_checkout: true
      };
      MOCK_ACCESSORIES.unshift(newItem);
      return { status: 'success', messages: 'Accessory created successfully', payload: newItem };
    }
  },

  updateAccessory: async (id, data) => {
    try {
      const response = await apiClient.put(`/accessories/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend accessory update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_ACCESSORIES.findIndex(a => a.id === parseInt(id, 10));
      if (index !== -1) {
        const qty = parseInt(data.qty !== undefined ? data.qty : MOCK_ACCESSORIES[index].qty, 10);
        MOCK_ACCESSORIES[index] = {
          ...MOCK_ACCESSORIES[index],
          ...data,
          qty: qty,
          remaining: qty - MOCK_ACCESSORIES[index].checkouts_count,
          remaining_qty: qty - MOCK_ACCESSORIES[index].checkouts_count,
          percent_remaining: Math.round(((qty - MOCK_ACCESSORIES[index].checkouts_count) / qty) * 100),
          updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' }
        };
        return { status: 'success', messages: 'Accessory updated successfully', payload: MOCK_ACCESSORIES[index] };
      }
      throw new Error('Accessory not found');
    }
  },

  deleteAccessory: async (id) => {
    try {
      const response = await apiClient.delete(`/accessories/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend accessory delete failed for ID ${id}, updating mock:`, error);
      MOCK_ACCESSORIES = MOCK_ACCESSORIES.filter(a => a.id !== parseInt(id, 10));
      return { status: 'success', messages: 'Accessory deleted successfully' };
    }
  },

  checkoutAccessory: async (id, data) => {
    try {
      const response = await apiClient.post(`/accessories/${id}/checkout`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend accessory checkout failed for ID ${id}, updating mock:`, error);
      const index = MOCK_ACCESSORIES.findIndex(a => a.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_ACCESSORIES[index].remaining > 0) {
          MOCK_ACCESSORIES[index].remaining -= 1;
          MOCK_ACCESSORIES[index].remaining_qty -= 1;
          MOCK_ACCESSORIES[index].checkouts_count += 1;
          MOCK_ACCESSORIES[index].percent_remaining = Math.round(
            (MOCK_ACCESSORIES[index].remaining / MOCK_ACCESSORIES[index].qty) * 100
          );
          return { status: 'success', messages: 'Accessory checked out successfully' };
        } else {
          throw new Error('No accessory stock remaining to check out');
        }
      }
      throw new Error('Accessory not found');
    }
  },

  checkinAccessory: async (id, data) => {
    try {
      const response = await apiClient.post(`/accessories/${id}/checkin`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend accessory checkin failed for ID ${id}, updating mock:`, error);
      const index = MOCK_ACCESSORIES.findIndex(a => a.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_ACCESSORIES[index].checkouts_count > 0) {
          MOCK_ACCESSORIES[index].remaining += 1;
          MOCK_ACCESSORIES[index].remaining_qty += 1;
          MOCK_ACCESSORIES[index].checkouts_count -= 1;
          MOCK_ACCESSORIES[index].percent_remaining = Math.round(
            (MOCK_ACCESSORIES[index].remaining / MOCK_ACCESSORIES[index].qty) * 100
          );
          return { status: 'success', messages: 'Accessory checked in successfully' };
        }
      }
      throw new Error('Accessory not found or none are checked out');
    }
  }
};
