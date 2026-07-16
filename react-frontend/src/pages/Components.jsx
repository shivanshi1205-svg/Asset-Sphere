import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Cpu, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { componentService } from '../services/componentService';
import { assetService } from '../services/assetService';
import { settingService } from '../services/settingService';

const Components = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [checkingOutComponent, setCheckingOutComponent] = useState(null);
  const [checkingInComponent, setCheckingInComponent] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Queries
  const { data: componentsRes, isLoading } = useQuery({
    queryKey: ['components', search],
    queryFn: () => componentService.getComponents({ search }),
  });

  const { data: assets } = useQuery({ queryKey: ['assets'], queryFn: () => assetService.getAssets() });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => settingService.categories.getAll() });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => settingService.locations.getAll() });

  // Mutations
  const createMutation = useMutation({
    mutationFn: componentService.createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => componentService.updateComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setEditingComponent(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: componentService.deleteComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ id, data }) => componentService.checkoutComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setCheckingOutComponent(null);
      checkoutReset();
    }
  });

  const checkinMutation = useMutation({
    mutationFn: ({ id, data }) => componentService.checkinComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setCheckingInComponent(null);
      checkinReset();
    }
  });

  // Forms
  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerCheckout, handleSubmit: handleSubmitCheckout, reset: checkoutReset } = useForm();
  const { register: registerCheckin, handleSubmit: handleSubmitCheckin, reset: checkinReset } = useForm();

  // Handlers
  const handleCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editingComponent.id, data });
  };

  const handleCheckoutSubmit = (data) => {
    checkoutMutation.mutate({ id: checkingOutComponent.id, data });
  };

  const handleCheckinSubmit = (data) => {
    checkinMutation.mutate({ id: checkingInComponent.id, data });
  };

  const triggerEdit = (comp) => {
    setEditingComponent(comp);
    setValue('name', comp.name);
    setValue('serial', comp.serial || '');
    setValue('qty', comp.qty || 0);
    setValue('min_qty', comp.min_qty || '');
    setValue('category_id', comp.category?.id || 7);
    setValue('location_id', comp.location?.id || 1);
    setValue('purchase_cost', comp.purchase_cost || '');
    setValue('notes', comp.notes || '');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this component?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        
        <button
          onClick={() => { reset(); setIsCreateOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all active:scale-95 ml-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Component</span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Component</th>
                <th scope="col" className="px-6 py-4">Serial Number</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Total Qty</th>
                <th scope="col" className="px-6 py-4">Remaining Qty</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading ? (
                [1, 2].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 rounded-full bg-slate-200 ml-auto"></div></td>
                  </tr>
                ))
              ) : componentsRes?.rows?.length > 0 ? (
                componentsRes.rows.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Cpu className="h-4 w-4 text-primary" />
                          <span>{comp.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {comp.serial || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {comp.category?.name || 'Component'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {comp.qty || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        comp.remaining > (comp.min_qty || 0)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          comp.remaining > (comp.min_qty || 0) ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></span>
                        {comp.remaining || 0} available
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {comp.remaining > 0 && (
                          <button
                            onClick={() => setCheckingOutComponent(comp)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                          >
                            Checkout to Asset
                          </button>
                        )}
                        {comp.remaining < comp.qty && (
                          <button
                            onClick={() => setCheckingInComponent(comp)}
                            className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all"
                          >
                            Checkin
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === comp.id ? null : comp.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          
                          {actionMenuOpen === comp.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-premium z-20 animate-in fade-in duration-100">
                                <button
                                  onClick={() => { triggerEdit(comp); setActionMenuOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit Component
                                </button>
                                <button
                                  onClick={() => { setActionMenuOpen(null); handleDelete(comp.id); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No components found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingComponent) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                {editingComponent ? 'Edit Component' : 'Create Component'}
              </h3>
              
              <form 
                onSubmit={editingComponent ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)}
                className="space-y-4 overflow-y-auto py-4 pr-1 flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Component Name *</label>
                    <input
                      type="text"
                      required
                      {...register('name')}
                      placeholder="e.g. Crucial DDR4 16GB"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Serial Number</label>
                    <input
                      type="text"
                      {...register('serial')}
                      placeholder="e.g. CR-DDR4-16G"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Total Quantity *</label>
                    <input
                      type="number"
                      required
                      {...register('qty')}
                      placeholder="e.g. 10"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Minimum Alert Qty</label>
                    <input
                      type="number"
                      {...register('min_qty')}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Default Location *</label>
                    <select
                      {...register('location_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                    <select
                      {...register('category_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {categories?.filter(c => c.category_type === 'Asset').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Purchase Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('purchase_cost')}
                      placeholder="e.g. 50.00"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows="2"
                    placeholder="Enter comments about components..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingComponent(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    {editingComponent ? 'Save Changes' : 'Create Component'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKOUT COMPONENT MODAL --- */}
      <AnimatePresence>
        {checkingOutComponent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkout Component to Asset</h3>
              <p className="text-xs text-slate-400 mb-6">Assigning one unit of <span className="font-bold text-slate-700">{checkingOutComponent.name}</span></p>
              
              <form onSubmit={handleSubmitCheckout(handleCheckoutSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Assign to Parent Asset *</label>
                  <select
                    required
                    {...registerCheckout('assigned_to_asset_id')}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                  >
                    <option value="">Select Asset...</option>
                    {assets?.rows?.map(a => <option key={a.id} value={a.id}>{a.name || a.model?.name} ({a.asset_tag})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                  <textarea
                    {...registerCheckout('checkout_notes')}
                    rows="2"
                    placeholder="Enter checkout comments..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingOutComponent(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    Checkout Component
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKIN COMPONENT MODAL --- */}
      <AnimatePresence>
        {checkingInComponent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkin Component</h3>
              <p className="text-xs text-slate-400 mb-6">Disassociating one unit of <span className="font-bold text-slate-700">{checkingInComponent.name}</span></p>
              
              <form onSubmit={handleSubmitCheckin(handleCheckinSubmit)} className="space-y-4">
                <p className="text-sm text-slate-600">This will disassociate the component from its assigned parent hardware asset and return it to stockroom storage room.</p>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Checkin Notes</label>
                  <textarea
                    {...registerCheckin('checkin_notes')}
                    rows="2"
                    placeholder="Enter return comments..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingInComponent(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
                  >
                    Checkin Component
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

export default Components;
