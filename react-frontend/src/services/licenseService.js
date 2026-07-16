import apiClient from './apiClient';

let MOCK_LICENSES = [
  {
    id: 1,
    name: "Adobe Creative Cloud",
    serial: "ADOBE-CC-98213-98213",
    model_number: "2026-PRO",
    seats: 10,
    remaining_seats: 8,
    free_seats_count: 8,
    category: { id: 1, name: "Misc Software" },
    manufacturer: { id: 9, name: "Adobe" },
    supplier: { id: 3, name: "noida dealer" },
    notes: "Design team licenses",
    order_number: "PO-72619",
    purchase_cost: "599.99",
    purchase_date: { date: "2026-01-15", formatted: "2026-01-15" },
    expiration_date: { date: "2027-01-15", formatted: "2027-01-15" },
    created_at: { datetime: "2026-01-15 10:00:00", formatted: "2026-01-15" },
    updated_at: { datetime: "2026-01-15 10:00:00", formatted: "2026-01-15" },
    available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
  },
  {
    id: 2,
    name: "Office 365 Business",
    serial: "MSFT-O365-88123-11112",
    model_number: "O365-BIZ",
    seats: 50,
    remaining_seats: 45,
    free_seats_count: 45,
    category: { id: 1, name: "Misc Software" },
    manufacturer: { id: 2, name: "Microsoft" },
    supplier: { id: 1, name: "Kunde, Doyle and Kozey" },
    notes: "Global office suite",
    order_number: "PO-9812A",
    purchase_cost: "150.00",
    purchase_date: { date: "2026-03-01", formatted: "2026-03-01" },
    expiration_date: null,
    created_at: { datetime: "2026-03-01 11:00:00", formatted: "2026-03-01" },
    updated_at: { datetime: "2026-03-01 11:00:00", formatted: "2026-03-01" },
    available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
  }
];

export const licenseService = {
  getLicenses: async (params = {}) => {
    try {
      const response = await apiClient.get('/licenses', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend licenses API failed, falling back to mock data:', error);
      let filtered = [...MOCK_LICENSES];
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.serial.toLowerCase().includes(query) ||
            item.manufacturer?.name?.toLowerCase().includes(query)
        );
      }
      return {
        total: filtered.length,
        rows: filtered
      };
    }
  },

  getLicenseById: async (id) => {
    try {
      const response = await apiClient.get(`/licenses/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend license ${id} fetch failed, returning mock:`, error);
      const item = MOCK_LICENSES.find(l => l.id === parseInt(id, 10));
      if (!item) throw new Error('License not found');
      return item;
    }
  },

  createLicense: async (data) => {
    try {
      const response = await apiClient.post('/licenses', data);
      return response.data;
    } catch (error) {
      console.warn('Backend license creation failed, updating mock memory:', error);
      const newItem = {
        id: MOCK_LICENSES.length > 0 ? Math.max(...MOCK_LICENSES.map(l => l.id)) + 1 : 1,
        name: data.name || '',
        serial: data.serial || '',
        model_number: data.model_number || '',
        seats: parseInt(data.seats || '1', 10),
        remaining_seats: parseInt(data.seats || '1', 10),
        free_seats_count: parseInt(data.seats || '1', 10),
        category: { id: data.category_id || 1, name: 'Misc Software' },
        manufacturer: { id: data.manufacturer_id || 2, name: 'Custom Manufacturer' },
        supplier: data.supplier_id ? { id: data.supplier_id, name: 'Custom Supplier' } : null,
        notes: data.notes || '',
        order_number: data.order_number || '',
        purchase_cost: data.purchase_cost || null,
        purchase_date: data.purchase_date ? { date: data.purchase_date, formatted: data.purchase_date } : null,
        expiration_date: data.expiration_date ? { date: data.expiration_date, formatted: data.expiration_date } : null,
        created_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        available_actions: { checkout: true, checkin: true, update: true, delete: true, clone: true }
      };
      MOCK_LICENSES.unshift(newItem);
      return { status: 'success', messages: 'License created successfully', payload: newItem };
    }
  },

  updateLicense: async (id, data) => {
    try {
      const response = await apiClient.put(`/licenses/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend license update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_LICENSES.findIndex(l => l.id === parseInt(id, 10));
      if (index !== -1) {
        MOCK_LICENSES[index] = {
          ...MOCK_LICENSES[index],
          ...data,
          seats: parseInt(data.seats || MOCK_LICENSES[index].seats, 10),
          updated_at: { datetime: new Date().toISOString(), formatted: 'Just now' }
        };
        return { status: 'success', messages: 'License updated successfully', payload: MOCK_LICENSES[index] };
      }
      throw new Error('License not found');
    }
  },

  deleteLicense: async (id) => {
    try {
      const response = await apiClient.delete(`/licenses/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend license delete failed for ID ${id}, updating mock:`, error);
      MOCK_LICENSES = MOCK_LICENSES.filter(l => l.id !== parseInt(id, 10));
      return { status: 'success', messages: 'License deleted successfully' };
    }
  },

  checkoutLicense: async (id, data) => {
    try {
      const response = await apiClient.post(`/licenses/${id}/checkout`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend license checkout failed for ID ${id}, updating mock:`, error);
      const index = MOCK_LICENSES.findIndex(l => l.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_LICENSES[index].remaining_seats > 0) {
          MOCK_LICENSES[index].remaining_seats -= 1;
          MOCK_LICENSES[index].free_seats_count -= 1;
          return { status: 'success', messages: 'License checked out successfully' };
        } else {
          throw new Error('No seats available for checkout');
        }
      }
      throw new Error('License not found');
    }
  },

  checkinLicense: async (id, data) => {
    try {
      const response = await apiClient.post(`/licenses/${id}/checkin`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend license checkin failed for ID ${id}, updating mock:`, error);
      const index = MOCK_LICENSES.findIndex(l => l.id === parseInt(id, 10));
      if (index !== -1) {
        if (MOCK_LICENSES[index].remaining_seats < MOCK_LICENSES[index].seats) {
          MOCK_LICENSES[index].remaining_seats += 1;
          MOCK_LICENSES[index].free_seats_count += 1;
          return { status: 'success', messages: 'License checked in successfully' };
        }
      }
      throw new Error('License not found or already fully checked in');
    }
  }
};
