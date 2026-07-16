import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Key, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  CheckCircle, 
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { licenseService } from '../services/licenseService';
import { userService } from '../services/userService';
import { settingService } from '../services/settingService';

const Licenses = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [checkingOutLicense, setCheckingOutLicense] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Queries
  const { data: licensesRes, isLoading } = useQuery({
    queryKey: ['licenses', search],
    queryFn: () => licenseService.getLicenses({ search }),
  });

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => userService.getUsers() });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => settingService.categories.getAll() });
  const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: () => settingService.manufacturers.getAll() });

  // Mutations
  const createMutation = useMutation({
    mutationFn: licenseService.createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => licenseService.updateLicense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setEditingLicense(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: licenseService.deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ id, data }) => licenseService.checkoutLicense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setCheckingOutLicense(null);
      checkoutReset();
    }
  });

  // Forms
  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerCheckout, handleSubmit: handleSubmitCheckout, reset: checkoutReset } = useForm();

  // Handlers
  const handleCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editingLicense.id, data });
  };

  const handleCheckoutSubmit = (data) => {
    checkoutMutation.mutate({ id: checkingOutLicense.id, data });
  };

  const triggerEdit = (lic) => {
    setEditingLicense(lic);
    setValue('name', lic.name);
    setValue('serial', lic.serial);
    setValue('model_number', lic.model_number || '');
    setValue('seats', lic.seats);
    setValue('category_id', lic.category?.id || 1);
    setValue('manufacturer_id', lic.manufacturer?.id || 2);
    setValue('purchase_cost', lic.purchase_cost || '');
    setValue('purchase_date', lic.purchase_date?.date || '');
    setValue('expiration_date', lic.expiration_date?.date || '');
    setValue('notes', lic.notes || '');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this license?')) {
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
            placeholder="Search licenses..."
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
          <span>Create License</span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Software License</th>
                <th scope="col" className="px-6 py-4">Product Key / Serial</th>
                <th scope="col" className="px-6 py-4">Seats</th>
                <th scope="col" className="px-6 py-4">Available</th>
                <th scope="col" className="px-6 py-4">Expiration</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading ? (
                [1, 2].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 rounded-full bg-slate-200 ml-auto"></div></td>
                  </tr>
                ))
              ) : licensesRes?.rows?.length > 0 ? (
                licensesRes.rows.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Key className="h-4 w-4 text-primary" />
                          <span>{lic.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{lic.manufacturer?.name || 'Unknown Manufacturer'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {lic.serial || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {lic.seats}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        lic.remaining_seats > 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          lic.remaining_seats > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></span>
                        {lic.remaining_seats} seats free
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {lic.expiration_date?.formatted ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lic.expiration_date.formatted}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">Never Expires</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lic.remaining_seats > 0 && (
                          <button
                            onClick={() => setCheckingOutLicense(lic)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                          >
                            Checkout Seat
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === lic.id ? null : lic.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          
                          {actionMenuOpen === lic.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-premium z-20 animate-in fade-in duration-100">
                                <button
                                  onClick={() => { triggerEdit(lic); setActionMenuOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit License
                                </button>
                                <button
                                  onClick={() => { setActionMenuOpen(null); handleDelete(lic.id); }}
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
                    No software licenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingLicense) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                {editingLicense ? 'Edit License' : 'Create License'}
              </h3>
              
              <form 
                onSubmit={editingLicense ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)}
                className="space-y-4 overflow-y-auto py-4 pr-1 flex-1"
              >
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Software Name *</label>
                  <input
                    type="text"
                    required
                    {...register('name')}
                    placeholder="e.g. Adobe Creative Cloud"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Product Key / Serial *</label>
                    <input
                      type="text"
                      required
                      {...register('serial')}
                      placeholder="e.g. XXXX-XXXX-XXXX"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Total Seats *</label>
                    <input
                      type="number"
                      required
                      {...register('seats')}
                      placeholder="e.g. 10"
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
                      {categories?.filter(c => c.category_type === 'License').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                      placeholder="e.g. 299.99"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Expiration Date</label>
                    <input
                      type="date"
                      {...register('expiration_date')}
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
                    onClick={() => { setIsCreateOpen(false); setEditingLicense(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    {editingLicense ? 'Save Changes' : 'Create License'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKOUT SEAT MODAL --- */}
      <AnimatePresence>
        {checkingOutLicense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkout License Seat</h3>
              <p className="text-xs text-slate-400 mb-6">Assigning a seat of <span className="font-bold text-slate-700">{checkingOutLicense.name}</span></p>
              
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
                    placeholder="Enter additional checkout comments..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingOutLicense(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    Checkout Seat
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

export default Licenses;
