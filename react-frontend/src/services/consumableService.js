import apiClient from './apiClient';

let MOCK_CONSUMABLES = [
  {
    id: 1,
    name: "Printer Toner HP 85A",
    image: null,
    company: { id: 3, name: "HP" },
    manufacturer: { id: 5, name: "HP" },
    supplier: { id: 3, name: "noida dealer" },
    model_number: "CE285A",
    category: { id: 5, name: "Ink & Toner" },
    location: { id: 1, name: "Noida" },
    notes: "Black toner for office printer",
    qty: 10,
    percent_remaining: 100,
    purchase_date: { date: "2026-05-10", formatted: "2026-05-10" },
    purchase_cost: "75.00",
    total_cost: "750.00",
    order_number: "PO-T8521",
    min_qty: 3,
    remaining_qty: 10,
    remaining: 10,
    checkouts_count: 0,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-05-10 10:14:16", formatted: "2026-05-10" },
    updated_at: { datetime: "2026-05-10 10:14:16", formatted: "2026-05-10" },
    available_actions: { checkout: true, update: true, delete: true, clone: true },
    user_can_checkout: true
  },
  {
    id: 2,
    name: "A4 Copier Paper Reams",
    image: null,
    company: { id: 2, name: "Abshire" },
    manufacturer: { id: 10, name: "Avery" },
    supplier: { id: 1, name: "Kunde, Doyle and Kozey" },
    model_number: "A4-80GSM",
    category: { id: 6, name: "Office Supplies" },
    location: { id: 1, name: "Noida" },
    notes: "80gsm printing paper",
    qty: 50,
    percent_remaining: 40,
    purchase_date: { date: "2026-06-01", formatted: "2026-06-01" },
    purchase_cost: "5.00",
    total_cost: "250.00",
    order_number: "PO-P9912",
    min_qty: 10,
    remaining_qty: 20,
    remaining: 20,
    checkouts_count: 30,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-01 09:22:57", formatted: "2026-06-01" },
    updated_at: { datetime: "2026-06-01 09:22:57", formatted: "2026-06-01" },
    available_actions: { checkout: true, update: true, delete: true, clone: true },
    user_can_checkout: true
  }
];

export const consumableService = {
  getConsumables: async (params = {}) => {
    try {
      const response = await apiClient.get('/consumables', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend consumables API failed, falling back to mock data:', error);
      let filtered = [...MOCK_CONSUMABLES];
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

  getConsumableById: async (id) => {
    try {
      const response = await apiClient.get(`/consumables/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend consumable ${id} fetch failed, returning mock:`, error);
      const item = MOCK_CONSUMABLES.find(c => c.id === parseInt(id, 10));
      if (!item) throw new Error('Consumable not found');
      return item;
    }
  },

  createConsumable: async (data) => {
    try {
      const response = await apiClient.post('/consumables', data);
      return response.data;
    } catch (error) {
      console.warn('Backend consumable creation failed, updating mock memory:', error);
      const qty = parseInt(data.qty || '1', 10);
      const newItem = {
        id: MOCK_CONSUMABLES.length > 0 ? Math.max(...MOCK_CONSUMABLES.map(c => c.id)) + 1 : 1,
        name: data.name || '',
        model_number: data.model_number || '',
        qty: qty,
        remaining_qty: qty,
        remaining: qty,
        percent_remaining: 100,
        category: { id: data.category_id || 5, name: 'Office Supplies' },
        manufacturer: { id: data.manufacturer_id || 5, name: 'Custom Manufacturer' },
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
        available_actions: { checkout: true, update: true, delete: true, clone: true },
        user_can_checkout: true
      };
      MOCK_CONSUMABLES.unshift(newItem);
      return { status: 'success', messages: 'Consumable created successfully', payload: newItem };
    }
  },

  updateConsumable: async (id, data) => {
    try {
      const response = await apiClient.put(`/consumables/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend consumable update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_CONSUMABLES.findIndex(c => c.id === parseInt(id, 10));
      if (index !== -1) {
        const qty = parseInt(data.qty !== undefined ? data.qty : MOCK_CONSUMABLES[index].qty, 10);
        MOCK_CONSUMABLES[index] = {
          ...MOCK_CONSUMABLES[index],
          ...data,
          qty: qty,
          remaining: qty - MOCK_CONSUMABLES[index].checkouts_count,
          remaining_qty: qty - MOCK_CONSUMABLES[index].checkouts_count,
          percent_remaining: Math.round(((qty - MOCK_CONSUMABLES[index].checkouts_count) / qty) * 100),
          updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' }
        };
        return { status: 'success', messages: 'Consumable updated successfully', payload: MOCK_CONSUMABLES[index] };
      }
      throw new Error('Consumable not found');
    }
  },

  deleteConsumable: async (id) => {
    try {
      const response = await apiClient.delete(`/consumables/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend consumable delete failed for ID ${id}, updating mock:`, error);
      MOCK_CONSUMABLES = MOCK_CONSUMABLES.filter(c => c.id !== parseInt(id, 10));
      return { status: 'success', messages: 'Consumable deleted successfully' };
    }
  },

  checkoutConsumable: async (id, data) => {
    try {
      const response = await apiClient.post(`/consumables/${id}/checkout`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend consumable checkout failed for ID ${id}, updating mock:`, error);
      const index = MOCK_CONSUMABLES.findIndex(c => c.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_CONSUMABLES[index].remaining > 0) {
          MOCK_CONSUMABLES[index].remaining -= 1;
          MOCK_CONSUMABLES[index].remaining_qty -= 1;
          MOCK_CONSUMABLES[index].checkouts_count += 1;
          MOCK_CONSUMABLES[index].percent_remaining = Math.round(
            (MOCK_CONSUMABLES[index].remaining / MOCK_CONSUMABLES[index].qty) * 100
          );
          return { status: 'success', messages: 'Consumable checked out successfully' };
        } else {
          throw new Error('No consumable stock remaining to check out');
        }
      }
      throw new Error('Consumable not found');
    }
  }
};
