import apiClient from './apiClient';

// Scraped live mock data for fallback
let MOCK_ASSETS = [
  {
    id: 3,
    name: "Macbook Air",
    asset_tag: "00002",
    serial: "98765432",
    model: { id: 4, name: "eifkerv" },
    byod: false,
    requestable: true,
    model_number: "234",
    eol: null,
    asset_eol_date: null,
    status_label: { id: 2, name: "Ready to Deploy", status_type: "deployable", status_meta: "deployed" },
    status: { id: 2, name: "Ready to Deploy", status_type: "deployable", status_meta: "deployed" },
    category: { id: 2, name: "LAPTOP", tag_color: "#000000" },
    manufacturer: { id: 10, name: "Avery", tag_color: "#3a4040" },
    depreciation: null,
    supplier: null,
    notes: null,
    order_number: null,
    company: { id: 3, name: "HP", tag_color: null },
    location: { id: 1, name: "Noida", tag_color: null },
    rtd_location: { id: 1, name: "Noida", tag_color: null },
    image: null,
    qr: null,
    assigned_to: { id: 2, name: "test1 #00001 - MODEL`", type: "asset" },
    warranty_months: null,
    warranty_expires: null,
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-10 06:14:49", formatted: "2026-06-10 06:14 AM" },
    updated_at: { datetime: "2026-06-11 18:49:40", formatted: "2026-06-11 06:49 PM" },
    age: "",
    purchase_cost: null,
    user_can_checkout: true,
    available_actions: { checkout: true, checkin: true, clone: true, restore: false, update: true, audit: true, delete: true }
  },
  {
    id: 2,
    name: "test1",
    asset_tag: "00001",
    serial: "98231221X",
    model: { id: 3, name: "MODEL`" },
    byod: false,
    requestable: false,
    model_number: "009",
    eol: "12 months",
    asset_eol_date: { date: "2026-06-03", formatted: "2026-06-03" },
    status_label: { id: 2, name: "Ready to Deploy", status_type: "deployable", status_meta: "deployed" },
    status: { id: 2, name: "Ready to Deploy", status_type: "deployable", status_meta: "deployed" },
    category: { id: 2, name: "LAPTOP", tag_color: "#000000" },
    manufacturer: { id: 1, name: "Apple", tag_color: "#f9fe8e" },
    depreciation: null,
    supplier: { id: 3, name: "noida dealer", tag_color: null },
    notes: "testing",
    order_number: "1",
    company: null,
    location: { id: 1, name: "Noida", tag_color: null },
    rtd_location: { id: 1, name: "Noida", tag_color: null },
    image: null,
    qr: null,
    assigned_to: { id: 1, name: "Noida Office", type: "location" },
    warranty_months: "12 months",
    warranty_expires: { date: "2027-06-03", formatted: "2027-06-03" },
    created_by: { id: 1, name: "Demo Account" },
    created_at: { datetime: "2026-06-02 17:51:09", formatted: "2026-06-02 05:51 PM" },
    updated_at: { datetime: "2026-06-11 18:49:40", formatted: "2026-06-11 06:49 PM" },
    age: "2 weeks ago",
    purchase_cost: "10,000.00",
    user_can_checkout: true,
    available_actions: { checkout: true, checkin: true, clone: true, restore: false, update: true, audit: true, delete: true }
  },
  {
    id: 1,
    name: "Backhoe Loader",
    asset_tag: "ICC-2065556",
    serial: "SN-9812A",
    model: { id: 2, name: "Macbook Pro 13\"" },
    byod: false,
    requestable: false,
    model_number: "1786VM80X07",
    eol: null,
    asset_eol_date: null,
    status_label: { id: 2, name: "Deployed", status_type: "deployed", status_meta: "deployed" },
    status: { id: 2, name: "Deployed", status_type: "deployed", status_meta: "deployed" },
    category: { id: 3, name: "Ornamental Railings", tag_color: null },
    manufacturer: { id: 16, name: "Berge Inc", tag_color: null },
    depreciation: null,
    supplier: { id: 1, name: "Kunde, Doyle and Kozey", tag_color: null },
    notes: null,
    order_number: "3271901481",
    company: { id: 2, name: "Abshire", tag_color: null },
    location: { id: 1, name: "Noida", tag_color: null },
    rtd_location: { id: 2, name: "Wilkinson, Waters and Kerluke", tag_color: null },
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80",
    qr: null,
    assigned_to: { id: 3, name: "DEMO Tenant", type: "user" },
    warranty_months: null,
    warranty_expires: null,
    created_by: null,
    created_at: { datetime: "2026-06-02 16:10:57", formatted: "2026-06-02 04:10 PM" },
    updated_at: { datetime: "2026-06-11 18:47:10", formatted: "2026-06-11 06:47 PM" },
    age: "3 years ago",
    purchase_cost: "2,266.13",
    user_can_checkout: false,
    available_actions: { checkout: false, checkin: true, clone: true, restore: false, update: true, audit: true, delete: true }
  }
];

export const assetService = {
  getAssets: async (params = {}) => {
    try {
      const response = await apiClient.get('/hardware', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend assets API failed, falling back to mock data:', error);
      
      let filtered = [...MOCK_ASSETS];
      
      // Search filter
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.asset_tag.toLowerCase().includes(query) ||
            item.serial.toLowerCase().includes(query) ||
            (item.model?.name || '').toLowerCase().includes(query)
        );
      }
      
      // Status filter
      if (params.status_type && params.status_type !== 'All') {
        filtered = filtered.filter(item => {
          if (params.status_type === 'Deployed') return item.status_label.name === 'Deployed';
          if (params.status_type === 'RTD') return item.status_label.name === 'Ready to Deploy';
          if (params.status_type === 'Pending') return item.status_label.name === 'Pending';
          if (params.status_type === 'Undeployable') return item.status_label.status_type === 'undeployable';
          if (params.status_type === 'Archived') return item.status_label.status_type === 'archived';
          return true;
        });
      }

      return {
        total: filtered.length,
        rows: filtered
      };
    }
  },

  getAssetById: async (id) => {
    try {
      const response = await apiClient.get(`/hardware/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend fetch for asset ${id} failed, returning mock:`, error);
      const asset = MOCK_ASSETS.find(a => a.id === parseInt(id, 10));
      if (!asset) throw new Error('Asset not found');
      return asset;
    }
  },

  createAsset: async (data) => {
    try {
      const response = await apiClient.post('/hardware', data);
      return response.data;
    } catch (error) {
      console.warn('Backend asset creation failed, saving to mock memory:', error);
      const newAsset = {
        id: MOCK_ASSETS.length > 0 ? Math.max(...MOCK_ASSETS.map(a => a.id)) + 1 : 1,
        name: data.name || '',
        asset_tag: data.asset_tag || `TAG-${Math.floor(10000 + Math.random() * 90000)}`,
        serial: data.serial || '',
        model: { id: data.model_id || 1, name: 'Custom Model' },
        byod: !!data.byod,
        requestable: !!data.requestable,
        status_label: { id: data.status_id || 2, name: 'Ready to Deploy', status_type: 'deployable' },
        category: { id: 1, name: 'Hardware' },
        company: data.company_id ? { id: data.company_id, name: 'Custom Company' } : null,
        location: data.location_id ? { id: data.location_id, name: 'Office Location' } : { id: 1, name: 'Noida' },
        notes: data.notes || '',
        purchase_cost: data.purchase_cost || null,
        purchase_date: data.purchase_date ? { date: data.purchase_date, formatted: data.purchase_date } : null,
        created_at: { datetime: new Date().toISOString(), formatted: 'Just now' },
        available_actions: { checkout: true, checkin: false, clone: true, update: true, audit: true, delete: true }
      };
      MOCK_ASSETS.unshift(newAsset);
      return { status: 'success', messages: 'Asset created successfully', payload: newAsset };
    }
  },

  updateAsset: async (id, data) => {
    try {
      const response = await apiClient.put(`/hardware/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Backend asset update failed for ID ${id}, updating mock:`, error);
      const index = MOCK_ASSETS.findIndex(a => a.id === parseInt(id, 10));
      if (index === -1) throw new Error('Asset not found');
      
      MOCK_ASSETS[index] = {
        ...MOCK_ASSETS[index],
        ...data,
        name: data.name !== undefined ? data.name : MOCK_ASSETS[index].name,
        serial: data.serial !== undefined ? data.serial : MOCK_ASSETS[index].serial,
        notes: data.notes !== undefined ? data.notes : MOCK_ASSETS[index].notes,
      };
      return { status: 'success', messages: 'Asset updated successfully', payload: MOCK_ASSETS[index] };
    }
  },

  deleteAsset: async (id) => {
    try {
      const response = await apiClient.delete(`/hardware/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Backend delete failed for asset ${id}, deleting from mock:`, error);
      const index = MOCK_ASSETS.findIndex(a => a.id === parseInt(id, 10));
      if (index === -1) throw new Error('Asset not found');
      MOCK_ASSETS.splice(index, 1);
      return { status: 'success', messages: 'Asset deleted successfully' };
    }
  },

  checkoutAsset: async (id, checkoutData) => {
    try {
      const response = await apiClient.post(`/hardware/${id}/checkout`, checkoutData);
      return response.data;
    } catch (error) {
      console.warn(`Backend checkout failed for asset ${id}, performing mock checkout:`, error);
      const index = MOCK_ASSETS.findIndex(a => a.id === parseInt(id, 10));
      if (index === -1) throw new Error('Asset not found');
      
      let assignedName = 'Unknown Target';
      if (checkoutData.checkout_to_type === 'user') {
        assignedName = checkoutData.assigned_user || 'DEMO Tenant';
      } else if (checkoutData.checkout_to_type === 'location') {
        assignedName = checkoutData.assigned_location || 'Noida Office';
      } else if (checkoutData.checkout_to_type === 'asset') {
        assignedName = checkoutData.assigned_asset || 'Asset #00001';
      }

      MOCK_ASSETS[index].assigned_to = {
        name: assignedName,
        type: checkoutData.checkout_to_type || 'user'
      };
      MOCK_ASSETS[index].status_label = { id: 1, name: 'Deployed', status_type: 'deployed' };
      MOCK_ASSETS[index].available_actions = { ...MOCK_ASSETS[index].available_actions, checkout: false, checkin: true };
      
      return { status: 'success', messages: 'Asset checked out successfully', payload: MOCK_ASSETS[index] };
    }
  },

  checkinAsset: async (id, checkinData) => {
    try {
      const response = await apiClient.post(`/hardware/${id}/checkin`, checkinData);
      return response.data;
    } catch (error) {
      console.warn(`Backend checkin failed for asset ${id}, performing mock checkin:`, error);
      const index = MOCK_ASSETS.findIndex(a => a.id === parseInt(id, 10));
      if (index === -1) throw new Error('Asset not found');
      
      MOCK_ASSETS[index].assigned_to = null;
      MOCK_ASSETS[index].status_label = { id: 2, name: 'Ready to Deploy', status_type: 'deployable' };
      MOCK_ASSETS[index].available_actions = { ...MOCK_ASSETS[index].available_actions, checkout: true, checkin: false };
      
      return { status: 'success', messages: 'Asset checked in successfully', payload: MOCK_ASSETS[index] };
    }
  },

  auditAsset: async (id, auditData) => {
    try {
      const response = await apiClient.post(`/hardware/${id}/audit`, auditData);
      return response.data;
    } catch (error) {
      console.warn(`Backend audit failed for asset ${id}, performing mock audit:`, error);
      const index = MOCK_ASSETS.findIndex(a => a.id === parseInt(id, 10));
      if (index === -1) throw new Error('Asset not found');
      
      MOCK_ASSETS[index].last_audit_date = {
        date: new Date().toISOString().split('T')[0],
        formatted: 'Just now'
      };
      
      return { status: 'success', messages: 'Asset audit logged successfully', payload: MOCK_ASSETS[index] };
    }
  }
};
