import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Settings as SettingsIcon,
  MapPin, 
  Tags, 
  ToggleLeft, 
  Briefcase, 
  Building2, 
  Truck, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { settingService } from '../services/settingService';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('categories');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Tabs layout configuration
  const tabs = [
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'statuslabels', label: 'Status Labels', icon: ToggleLeft },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'manufacturers', label: 'Manufacturers', icon: Briefcase },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'departments', label: 'Departments', icon: Users },
  ];

  // React Query Fetch Query
  const { data: items, isLoading } = useQuery({
    queryKey: ['settings', activeTab],
    queryFn: () => settingService[activeTab].getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => settingService[activeTab].create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', activeTab] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingService[activeTab].update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', activeTab] });
      setEditingItem(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => settingService[activeTab].delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', activeTab] });
    }
  });

  // Forms
  const { register, handleSubmit, reset, setValue } = useForm();

  // Handlers
  const handleCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editingItem.id, data });
  };

  const triggerEdit = (item) => {
    setEditingItem(item);
    // Preset form values based on active tab fields
    setValue('name', item.name);
    if (activeTab === 'categories') {
      setValue('category_type', item.category_type);
      setValue('tag_color', item.tag_color || '');
    } else if (activeTab === 'locations') {
      setValue('address', item.address || '');
      setValue('city', item.city || '');
      setValue('state', item.state || '');
      setValue('country', item.country || '');
      setValue('zip', item.zip || '');
    } else if (activeTab === 'statuslabels') {
      setValue('type', item.type);
      setValue('notes', item.notes || '');
    } else if (activeTab === 'companies') {
      setValue('tag_color', item.tag_color || '');
    } else if (activeTab === 'manufacturers') {
      setValue('url', item.url || '');
      setValue('support_phone', item.support_phone || '');
    } else if (activeTab === 'suppliers') {
      setValue('phone', item.phone || '');
      setValue('contact', item.contact || '');
    } else if (activeTab === 'departments') {
      setValue('code', item.code || '');
      setValue('manager', item.manager || '');
    }
  };

  const handleDelete = (id) => {
    if (confirm(`Are you sure you want to delete this setting item?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Sidebar Tabs */}
      <div className="lg:col-span-1 space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2 px-3 py-2 text-slate-400 border-b border-slate-100 mb-2">
          <SettingsIcon className="h-4.5 w-4.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Metadata Settings</span>
        </div>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingItem(null); setIsCreateOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Panel */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-800">
            Manage {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <button
            onClick={() => { reset(); setIsCreateOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all active:scale-95"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Item</span>
          </button>
        </div>

        {/* Setting Items List Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Name</th>
                  {activeTab === 'categories' && <th scope="col" className="px-6 py-4">Category Type</th>}
                  {activeTab === 'locations' && <th scope="col" className="px-6 py-4">Address</th>}
                  {activeTab === 'statuslabels' && <th scope="col" className="px-6 py-4">Status Type</th>}
                  {activeTab === 'manufacturers' && <th scope="col" className="px-6 py-4">Website</th>}
                  {activeTab === 'suppliers' && <th scope="col" className="px-6 py-4">Phone / Contact</th>}
                  {activeTab === 'departments' && <th scope="col" className="px-6 py-4">Code / Manager</th>}
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                {isLoading ? (
                  [1, 2].map((idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-slate-200"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-6 w-12 rounded bg-slate-200 ml-auto"></div></td>
                    </tr>
                  ))
                ) : items?.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-semibold">{item.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          {item.tag_color && (
                            <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: item.tag_color }} />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      
                      {/* Sub-fields depending on active tab */}
                      {activeTab === 'categories' && (
                        <td className="px-6 py-4 text-slate-500 font-semibold">{item.category_type}</td>
                      )}
                      {activeTab === 'locations' && (
                        <td className="px-6 py-4 text-slate-500">{item.address || 'N/A'}</td>
                      )}
                      {activeTab === 'statuslabels' && (
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.type === 'deployable' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                      )}
                      {activeTab === 'manufacturers' && (
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.url || 'N/A'}</td>
                      )}
                      {activeTab === 'suppliers' && (
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {item.phone ? `${item.phone} (${item.contact || 'Main'})` : 'N/A'}
                        </td>
                      )}
                      {activeTab === 'departments' && (
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {item.code ? `${item.code} - ${item.manager || 'No Manager'}` : 'N/A'}
                        </td>
                      )}

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => triggerEdit(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      No settings items configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                {editingItem ? 'Edit Configuration' : 'Create New Configuration'}
              </h3>
              
              <form onSubmit={editingItem ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    {...register('name')}
                    placeholder={`e.g. Noida HQ`}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Categories Extra Fields */}
                {activeTab === 'categories' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Category Type</label>
                      <select
                        {...register('category_type')}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                      >
                        <option value="Asset">Asset (Hardware)</option>
                        <option value="License">License (Software)</option>
                        <option value="Accessory">Accessory</option>
                        <option value="Consumable">Consumable</option>
                        <option value="Component">Component</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Tag color (Hex)</label>
                      <input
                        type="text"
                        {...register('tag_color')}
                        placeholder="e.g. #000000"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}

                {/* Locations Extra Fields */}
                {activeTab === 'locations' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Street Address</label>
                      <input
                        type="text"
                        {...register('address')}
                        placeholder="e.g. Sector 62, Block B"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                        <input
                          type="text"
                          {...register('city')}
                          placeholder="e.g. Noida"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">State / Zip</label>
                        <input
                          type="text"
                          {...register('state')}
                          placeholder="e.g. UP"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Status Label Extra Fields */}
                {activeTab === 'statuslabels' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Label Status Type</label>
                      <select
                        {...register('type')}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      >
                        <option value="deployable">Deployable (Available for assignment)</option>
                        <option value="undeployable">Undeployable (Not ready for deployment)</option>
                        <option value="archived">Archived (Retired / No longer exists)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Description / Notes</label>
                      <textarea
                        {...register('notes')}
                        rows="2"
                        placeholder="Enter label details..."
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Manufacturers Extra Fields */}
                {activeTab === 'manufacturers' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Support Website</label>
                      <input
                        type="text"
                        {...register('url')}
                        placeholder="e.g. support.apple.com"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Support Phone</label>
                      <input
                        type="text"
                        {...register('support_phone')}
                        placeholder="e.g. +1-800-MY-APPLE"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Suppliers Extra Fields */}
                {activeTab === 'suppliers' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Supplier Contact Phone</label>
                      <input
                        type="text"
                        {...register('phone')}
                        placeholder="e.g. +91 9999 8888 77"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Contact Person</label>
                      <input
                        type="text"
                        {...register('contact')}
                        placeholder="e.g. Shubham Agarwal"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Departments Extra Fields */}
                {activeTab === 'departments' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Department Code</label>
                      <input
                        type="text"
                        {...register('code')}
                        placeholder="e.g. ENG"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Manager</label>
                      <input
                        type="text"
                        {...register('manager')}
                        placeholder="e.g. Shubham Agarwal"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Companies Extra Fields */}
                {activeTab === 'companies' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Tag color (Hex)</label>
                    <input
                      type="text"
                      {...register('tag_color')}
                      placeholder="e.g. #2aa0e3"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingItem(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    {editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
