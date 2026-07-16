import apiClient from './apiClient';

// --- MOCK STORAGE ---
let MOCK_CATEGORIES = [
  { id: 2, name: "LAPTOP", category_type: "Asset", tag_color: "#000000", item_count: 2 },
  { id: 3, name: "Ornamental Railings", category_type: "Asset", tag_color: null, item_count: 1 },
  { id: 1, name: "Misc Software", category_type: "License", tag_color: null, item_count: 2 },
  { id: 4, name: "MOUSE", category_type: "Accessory", tag_color: null, item_count: 4 }
];

let MOCK_LOCATIONS = [
  { id: 1, name: "Noida Office", address: "Sector 62, Noida", city: "Noida", state: "UP", country: "India", zip: "201301", assets_count: 3, users_count: 2 },
  { id: 2, name: "Wilkinson HQ", address: "0406 Emmet Drive", city: "Noida", state: "UP", country: "India", zip: "201301", assets_count: 1, users_count: 0 }
];

let MOCK_STATUS_LABELS = [
  { id: 1, name: "Undeployable", type: "undeployable", notes: "Configuration or parts pending.", assets_count: 0 },
  { id: 2, name: "Ready to Deploy", type: "deployable", notes: "Ready for user assignment.", assets_count: 3 },
  { id: 3, name: "Archived", type: "archived", notes: "No longer viable.", assets_count: 0 }
];

let MOCK_COMPANIES = [
  { id: 3, name: "HP", tag_color: null, assets_count: 1, accessories_count: 2 },
  { id: 2, name: "Abshire", tag_color: null, assets_count: 1, accessories_count: 2 },
  { id: 1, name: "DJT CORP", tag_color: "#2aa0e3", assets_count: 0, accessories_count: 0 }
];

let MOCK_MANUFACTURERS = [
  { id: 1, name: "Apple", url: "apple.com", support_phone: "+19859827928", assets_count: 1 },
  { id: 5, name: "HP", url: "hp.com", support_phone: "+12346876532", assets_count: 0 },
  { id: 10, name: "Avery", url: "avery.com", support_phone: "385-390-2306", assets_count: 1 },
  { id: 2, name: "Microsoft", url: "microsoft.com", support_phone: "+14584619957", assets_count: 0 }
];

let MOCK_SUPPLIERS = [
  { id: 3, name: "noida dealer", phone: "01111321323213", contact: "8132132323", assets_count: 1 },
  { id: 2, name: "Runte-Corwin", phone: "", contact: "", assets_count: 0 },
  { id: 1, name: "Kunde, Doyle and Kozey", phone: "", contact: "", assets_count: 1 }
];

let MOCK_DEPARTMENTS = [
  { id: 1, name: "Engineering", code: "ENG", manager: "Demo Account", users_count: 3 },
  { id: 2, name: "Design", code: "DES", manager: "Awdhesh Soni", users_count: 1 },
  { id: 3, name: "Operations", code: "OPS", manager: null, users_count: 0 }
];

// --- SERVICE HELPER MAKER ---
const makeSettingService = (endpoint, mockData, defaultNew) => {
  let localData = [...mockData];
  return {
    getAll: async () => {
      try {
        const res = await apiClient.get(`/${endpoint}`);
        return res.data.rows || res.data;
      } catch (e) {
        console.warn(`Settings backend for /${endpoint} failed, using mock data.`);
        return localData;
      }
    },
    create: async (data) => {
      try {
        const res = await apiClient.post(`/${endpoint}`, data);
        return res.data;
      } catch (e) {
        console.warn(`Settings creation failed on /${endpoint}, writing mock.`);
        const newItem = {
          id: localData.length > 0 ? Math.max(...localData.map(x => x.id)) + 1 : 1,
          ...defaultNew(data)
        };
        localData.unshift(newItem);
        return { status: 'success', messages: 'Created successfully', payload: newItem };
      }
    },
    update: async (id, data) => {
      try {
        const res = await apiClient.put(`/${endpoint}/${id}`, data);
        return res.data;
      } catch (e) {
        console.warn(`Settings update failed on /${endpoint}/${id}, updating mock.`);
        const index = localData.findIndex(x => x.id === parseInt(id, 10));
        if (index !== -1) {
          localData[index] = { ...localData[index], ...data };
          return { status: 'success', messages: 'Updated successfully', payload: localData[index] };
        }
        throw new Error('Not found');
      }
    },
    delete: async (id) => {
      try {
        const res = await apiClient.delete(`/${endpoint}/${id}`);
        return res.data;
      } catch (e) {
        console.warn(`Settings deletion failed on /${endpoint}/${id}, deleting mock.`);
        localData = localData.filter(x => x.id !== parseInt(id, 10));
        return { status: 'success', messages: 'Deleted successfully' };
      }
    }
  };
};

export const settingService = {
  categories: makeSettingService(
    'categories', 
    MOCK_CATEGORIES, 
    (d) => ({ name: d.name, category_type: d.category_type || 'Asset', tag_color: d.tag_color || null, item_count: 0 })
  ),
  locations: makeSettingService(
    'locations', 
    MOCK_LOCATIONS, 
    (d) => ({ name: d.name, address: d.address || '', city: d.city || '', state: d.state || '', country: d.country || '', zip: d.zip || '', assets_count: 0, users_count: 0 })
  ),
  statuslabels: makeSettingService(
    'statuslabels', 
    MOCK_STATUS_LABELS, 
    (d) => ({ name: d.name, type: d.type || 'deployable', notes: d.notes || '', assets_count: 0 })
  ),
  companies: makeSettingService(
    'companies', 
    MOCK_COMPANIES, 
    (d) => ({ name: d.name, tag_color: d.tag_color || null, assets_count: 0, accessories_count: 0 })
  ),
  manufacturers: makeSettingService(
    'manufacturers', 
    MOCK_MANUFACTURERS, 
    (d) => ({ name: d.name, url: d.url || '', support_phone: d.support_phone || '', assets_count: 0 })
  ),
  suppliers: makeSettingService(
    'suppliers', 
    MOCK_SUPPLIERS, 
    (d) => ({ name: d.name, phone: d.phone || '', contact: d.contact || '', assets_count: 0 })
  ),
  departments: makeSettingService(
    'departments', 
    MOCK_DEPARTMENTS, 
    (d) => ({ name: d.name, code: d.code || '', manager: d.manager || null, users_count: 0 })
  )
};
