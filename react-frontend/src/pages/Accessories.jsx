import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Keyboard, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  ArrowRightLeft, 
  Users,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { accessoryService } from '../services/accessoryService';
import { userService } from '../services/userService';
import { settingService } from '../services/settingService';

const Accessories = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [checkingOutAccessory, setCheckingOutAccessory] = useState(null);
  const [checkingInAccessory, setCheckingInAccessory] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Queries
  const { data: accessoriesRes, isLoading } = useQuery({
    queryKey: ['accessories', search],
    queryFn: () => accessoryService.getAccessories({ search }),
  });

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => userService.getUsers() });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => settingService.categories.getAll() });
  const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: () => settingService.manufacturers.getAll() });

  // Mutations
  const createMutation = useMutation({
    mutationFn: accessoryService.createAccessory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => accessoryService.updateAccessory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setEditingAccessory(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: accessoryService.deleteAccessory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ id, data }) => accessoryService.checkoutAccessory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setCheckingOutAccessory(null);
      checkoutReset();
    }
  });

  const checkinMutation = useMutation({
    mutationFn: ({ id, data }) => accessoryService.checkinAccessory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setCheckingInAccessory(null);
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
    updateMutation.mutate({ id: editingAccessory.id, data });
  };

  const handleCheckoutSubmit = (data) => {
    checkoutMutation.mutate({ id: checkingOutAccessory.id, data });
  };

  const handleCheckinSubmit = (data) => {
    checkinMutation.mutate({ id: checkingInAccessory.id, data });
  };

  const triggerEdit = (acc) => {
    setEditingAccessory(acc);
    setValue('name', acc.name);
    setValue('model_number', acc.model_number || '');
    setValue('qty', acc.qty || 0);
    setValue('min_qty', acc.min_qty || '');
    setValue('category_id', acc.category?.id || 4);
    setValue('manufacturer_id', acc.manufacturer?.id || 5);
    setValue('purchase_cost', acc.purchase_cost || '');
    setValue('purchase_date', acc.purchase_date?.date || '');
    setValue('notes', acc.notes || '');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
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
            placeholder="Search accessories..."
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
          <span>Create Accessory</span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Accessory</th>
                <th scope="col" className="px-6 py-4">Model No.</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Total Qty</th>
                <th scope="col" className="px-6 py-4">Available Qty</th>
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
              ) : accessoriesRes?.rows?.length > 0 ? (
                accessoriesRes.rows.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Keyboard className="h-4 w-4 text-primary" />
                          <span>{acc.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{acc.manufacturer?.name || 'Unknown Manufacturer'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {acc.model_number || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {acc.category?.name || 'Accessory'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {acc.qty || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        acc.remaining > (acc.min_qty || 0)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          acc.remaining > (acc.min_qty || 0) ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {acc.remaining || 0} available
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {acc.remaining > 0 && (
                          <button
                            onClick={() => setCheckingOutAccessory(acc)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                          >
                            Checkout
                          </button>
                        )}
                        {acc.checkouts_count > 0 && (
                          <button
                            onClick={() => setCheckingInAccessory(acc)}
                            className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all"
                          >
                            Checkin
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === acc.id ? null : acc.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          
                          {actionMenuOpen === acc.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-premium z-20 animate-in fade-in duration-100">
                                <button
                                  onClick={() => { triggerEdit(acc); setActionMenuOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit Accessory
                                </button>
                                <button
                                  onClick={() => { setActionMenuOpen(null); handleDelete(acc.id); }}
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
                    No accessories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingAccessory) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                {editingAccessory ? 'Edit Accessory' : 'Create Accessory'}
              </h3>
              
              <form 
                onSubmit={editingAccessory ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)}
                className="space-y-4 overflow-y-auto py-4 pr-1 flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Accessory Name *</label>
                    <input
                      type="text"
                      required
                      {...register('name')}
                      placeholder="e.g. Dell KB216 Keyboard"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Model Number</label>
                    <input
                      type="text"
                      {...register('model_number')}
                      placeholder="e.g. KB-216"
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
                      placeholder="e.g. 50"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Minimum Alert Qty</label>
                    <input
                      type="number"
                      {...register('min_qty')}
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Manufacturer *</label>
                    <select
                      {...register('manufacturer_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {manufacturers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                    <select
                      {...register('category_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {categories?.filter(c => c.category_type === 'Accessory').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                      placeholder="e.g. 15.00"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Purchase Date</label>
                    <input
                      type="date"
                      {...register('purchase_date')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows="2"
                    placeholder="Enter notes about software licenses..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingAccessory(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    {editingAccessory ? 'Save Changes' : 'Create Accessory'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKOUT ACCESSORY MODAL --- */}
      <AnimatePresence>
        {checkingOutAccessory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkout Accessory</h3>
              <p className="text-xs text-slate-400 mb-6">Assigning one unit of <span className="font-bold text-slate-700">{checkingOutAccessory.name}</span></p>
              
              <form onSubmit={handleSubmitCheckout(handleCheckoutSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Assign To User *</label>
                  <select
                    required
                    {...registerCheckout('assigned_to_user_id')}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                  >
                    <option value="">Select User...</option>
                    {users?.rows?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                  <textarea
                    {...registerCheckout('checkout_notes')}
                    rows="2"
                    placeholder="Enter additional comments..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingOutAccessory(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    Checkout Accessory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKIN ACCESSORY MODAL --- */}
      <AnimatePresence>
        {checkingInAccessory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkin Accessory</h3>
              <p className="text-xs text-slate-400 mb-6">Returning one unit of <span className="font-bold text-slate-700">{checkingInAccessory.name}</span></p>
              
              <form onSubmit={handleSubmitCheckin(handleCheckinSubmit)} className="space-y-4">
                <p className="text-sm text-slate-600">This will return one accessory back to the available stock room inventory.</p>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Checkin Notes</label>
                  <textarea
                    {...registerCheckin('checkin_notes')}
                    rows="2"
                    placeholder="Enter additional comments..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingInAccessory(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
                  >
                    Checkin Accessory
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

export default Accessories;
