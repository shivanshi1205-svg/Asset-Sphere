import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  Edit2, 
  Trash2, 
  ArrowRightLeft,
  Calendar,
  DollarSign,
  ClipboardCheck,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { assetService } from '../services/assetService';
import { settingService } from '../services/settingService';
import { userService } from '../services/userService';

const Assets = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusType, setStatusType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [checkingOutAsset, setCheckingOutAsset] = useState(null);
  const [checkingInAsset, setCheckingInAsset] = useState(null);
  const [auditingAsset, setAuditingAsset] = useState(null);
  const [detailedAsset, setDetailedAsset] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Queries
  const { data: assetsRes, isLoading, refetch } = useQuery({
    queryKey: ['assets', search, statusType, currentPage],
    queryFn: () => assetService.getAssets({ search, status_type: statusType, page: currentPage }),
  });

  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => settingService.locations.getAll() });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => settingService.categories.getAll() });
  const { data: statusLabels } = useQuery({ queryKey: ['statuslabels'], queryFn: () => settingService.statuslabels.getAll() });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => userService.getUsers() });

  // Mutations
  const createMutation = useMutation({
    mutationFn: assetService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assetService.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditingAsset(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: assetService.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ id, data }) => assetService.checkoutAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setCheckingOutAsset(null);
      checkoutReset();
    }
  });

  const checkinMutation = useMutation({
    mutationFn: ({ id, data }) => assetService.checkinAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setCheckingInAsset(null);
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
    updateMutation.mutate({ id: editingAsset.id, data });
  };

  const handleCheckoutSubmit = (data) => {
    checkoutMutation.mutate({ id: checkingOutAsset.id, data });
  };

  const handleCheckinSubmit = (data) => {
    checkinMutation.mutate({ id: checkingInAsset.id, data });
  };

  const triggerEdit = (asset) => {
    setEditingAsset(asset);
    setValue('name', asset.name);
    setValue('asset_tag', asset.asset_tag);
    setValue('serial', asset.serial);
    setValue('model_id', asset.model?.id || 1);
    setValue('status_id', asset.status_label?.id || 2);
    setValue('location_id', asset.location?.id || 1);
    setValue('notes', asset.notes || '');
    setValue('purchase_cost', asset.purchase_cost || '');
    setValue('purchase_date', asset.purchase_date?.date || '');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
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
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusType}
              onChange={(e) => setStatusType(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Deployed">Deployed</option>
              <option value="RTD">Ready to Deploy</option>
              <option value="Undeployable">Undeployable</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <button
            onClick={() => { reset(); setIsCreateOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all active:scale-95"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Asset</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Asset Tag</th>
                <th scope="col" className="px-6 py-4">Name / Model</th>
                <th scope="col" className="px-6 py-4">Serial</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Assigned To</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading ? (
                [1, 2, 3].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 rounded-full bg-slate-200 ml-auto"></div></td>
                  </tr>
                ))
              ) : assetsRes?.rows?.length > 0 ? (
                assetsRes.rows.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                      {asset.asset_tag}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-800">{asset.name || asset.model?.name || 'Unnamed Asset'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{asset.category?.name || 'Hardware'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {asset.serial || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        asset.status_label?.status_type === 'deployable' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : asset.status_label?.status_type === 'undeployable' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          asset.status_label?.status_type === 'deployable' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {asset.status_label?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {asset.assigned_to ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="truncate max-w-[150px]">{asset.assigned_to.name}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <XCircle className="h-4 w-4 text-slate-300" />
                          <span>Unassigned</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setDetailedAsset(asset)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        
                        {asset.available_actions?.checkout && !asset.assigned_to && (
                          <button
                            onClick={() => setCheckingOutAsset(asset)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
                          >
                            Checkout
                          </button>
                        )}
                        {asset.available_actions?.checkin && asset.assigned_to && (
                          <button
                            onClick={() => setCheckingInAsset(asset)}
                            className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all"
                          >
                            Checkin
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === asset.id ? null : asset.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          
                          {actionMenuOpen === asset.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-premium z-20 animate-in fade-in duration-100">
                                <button
                                  onClick={() => { triggerEdit(asset); setActionMenuOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit Asset
                                </button>
                                <button
                                  onClick={() => { setActionMenuOpen(null); handleDelete(asset.id); }}
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
                    No assets found. Try adjusting filters or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingAsset) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                {editingAsset ? 'Edit Asset' : 'Create Asset'}
              </h3>
              
              <form 
                onSubmit={editingAsset ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)}
                className="space-y-4 overflow-y-auto py-4 pr-1 flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Asset Tag *</label>
                    <input
                      type="text"
                      required
                      {...register('asset_tag')}
                      placeholder="e.g. TAG-00001"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Asset Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. MacBook Pro"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Serial Number</label>
                    <input
                      type="text"
                      {...register('serial')}
                      placeholder="e.g. SN-9812A"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Status Label *</label>
                    <select
                      {...register('status_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {statusLabels?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
                    <select
                      {...register('category_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {categories?.filter(c => c.category_type === 'Asset').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Default Location</label>
                    <select
                      {...register('location_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Purchase Date</label>
                    <input
                      type="date"
                      {...register('purchase_date')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Purchase Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('purchase_cost')}
                      placeholder="e.g. 1200.00"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows="2"
                    placeholder="Enter additional asset notes..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingAsset(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 active:scale-95 transition-all"
                  >
                    {editingAsset ? 'Save Changes' : 'Create Asset'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKOUT MODAL --- */}
      <AnimatePresence>
        {checkingOutAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkout Asset</h3>
              <p className="text-xs text-slate-400 mb-6">Assigning Asset <span className="font-bold text-slate-700">{checkingOutAsset.asset_tag} ({checkingOutAsset.name || checkingOutAsset.model?.name})</span></p>
              
              <form onSubmit={handleSubmitCheckout(handleCheckoutSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Assign To User</label>
                  <select
                    {...registerCheckout('assigned_to_user_id')}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                  >
                    <option value="">Select User...</option>
                    {users?.rows?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Checkout Notes</label>
                  <textarea
                    {...registerCheckout('checkout_notes')}
                    rows="2"
                    placeholder="Provide comments about this assignment..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingOutAsset(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    Checkout Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CHECKIN MODAL --- */}
      <AnimatePresence>
        {checkingInAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Checkin Asset</h3>
              <p className="text-xs text-slate-400 mb-6">Returning Asset <span className="font-bold text-slate-700">{checkingInAsset.asset_tag} ({checkingInAsset.name || checkingInAsset.model?.name})</span></p>
              
              <form onSubmit={handleSubmitCheckin(handleCheckinSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status Label *</label>
                  <select
                    {...registerCheckin('status_id')}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                  >
                    {statusLabels?.filter(s => s.type !== 'archived').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Checkin Notes</label>
                  <textarea
                    {...registerCheckin('checkin_notes')}
                    rows="2"
                    placeholder="Provide comments about this return..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCheckingInAsset(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
                  >
                    Checkin Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAILED VIEW SLIDEOUT PANEL --- */}
      <AnimatePresence>
        {detailedAsset && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDetailedAsset(null)} />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-premium border-l border-slate-100 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asset Specifications</span>
                  <h3 className="font-display text-lg font-bold text-slate-800 mt-0.5">{detailedAsset.asset_tag}</h3>
                </div>
                <button 
                  onClick={() => setDetailedAsset(null)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {detailedAsset.image && (
                  <div className="rounded-xl overflow-hidden aspect-video border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <img src={detailedAsset.image} alt={detailedAsset.name} className="object-cover w-full h-full" />
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">General Information</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Name</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Model</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.model?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Model Number</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.model_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Serial Number</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.serial || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Category</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.category?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Manufacturer</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.manufacturer?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">Deployment & Status</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Status Label</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.status_label?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Assigned To</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.assigned_to?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Location</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.location?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">RTD Location</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.rtd_location?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">Purchase Details</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Purchase Date</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.purchase_date?.date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Purchase Cost</p>
                      <p className="text-slate-700 font-semibold mt-0.5">
                        {detailedAsset.purchase_cost ? `$${detailedAsset.purchase_cost}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Warranty</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.warranty_months || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Supplier</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{detailedAsset.supplier?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {detailedAsset.custom_fields && Object.keys(detailedAsset.custom_fields).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-wide">Custom Fields</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      {Object.entries(detailedAsset.custom_fields).map(([label, info]) => (
                        <div key={label}>
                          <p className="text-slate-400 font-medium">{label}</p>
                          <p className="text-slate-700 font-semibold mt-0.5">{info.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailedAsset.notes && (
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 font-medium">Notes</p>
                    <p className="text-slate-600 bg-slate-50 rounded-xl p-3 leading-relaxed">{detailedAsset.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assets;
