import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  User, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Eye,
  Mail,
  Shield,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { userService } from '../services/userService';
import { settingService } from '../services/settingService';

const Users = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailedUser, setDetailedUser] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Queries
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => userService.getUsers({ search }),
  });

  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => settingService.locations.getAll() });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => settingService.departments.getAll() });

  // Mutations
  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Forms
  const { register, handleSubmit, reset, setValue } = useForm();

  // Handlers
  const handleCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editingUser.id, data });
  };

  const triggerEdit = (u) => {
    setEditingUser(u);
    setValue('first_name', u.first_name || '');
    setValue('last_name', u.last_name || '');
    setValue('username', u.username);
    setValue('email', u.email || '');
    setValue('employee_num', u.employee_num || '');
    setValue('jobtitle', u.jobtitle || '');
    setValue('role', u.role || 'Staff');
    setValue('location_id', u.location?.id || '');
    setValue('activated', u.activated);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
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
            placeholder="Search people..."
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
          <span>Create Person</span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Name</th>
                <th scope="col" className="px-6 py-4">Username</th>
                <th scope="col" className="px-6 py-4">Email</th>
                <th scope="col" className="px-6 py-4">Job Title / Role</th>
                <th scope="col" className="px-6 py-4">Assets</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading ? (
                [1, 2].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 w-10 rounded-full bg-slate-200 inline-block mr-3"></div><div className="h-4 w-24 rounded bg-slate-200 inline-block align-middle"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-slate-200"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-200"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 rounded-full bg-slate-200 ml-auto"></div></td>
                  </tr>
                ))
              ) : usersRes?.rows?.length > 0 ? (
                usersRes.rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.avatar || 'http://3.6.21.202:8000/uploads/default.png'} 
                          alt={u.name} 
                          className="h-10 w-10 rounded-full border border-slate-100 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{u.employee_num || 'No Employee ID'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.email || <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-700">{u.jobtitle || 'Staff'}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>{u.role || 'User'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {u.assets_count || 0} assets
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.activated 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          u.activated ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        {u.activated ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setDetailedUser(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="View user details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          
                          {actionMenuOpen === u.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-premium z-20 animate-in fade-in duration-100">
                                <button
                                  onClick={() => { triggerEdit(u); setActionMenuOpen(null); }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit Person
                                </button>
                                <button
                                  onClick={() => { setActionMenuOpen(null); handleDelete(u.id); }}
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
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      <AnimatePresence>
        {(isCreateOpen || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-premium flex flex-col max-h-[90vh]"
            >
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                {editingUser ? 'Edit User Details' : 'Create New User'}
              </h3>
              
              <form 
                onSubmit={editingUser ? handleSubmit(handleEditSubmit) : handleSubmit(handleCreateSubmit)}
                className="space-y-4 overflow-y-auto py-4 pr-1 flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      {...register('first_name')}
                      placeholder="e.g. John"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      {...register('last_name')}
                      placeholder="e.g. Doe"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      {...register('username')}
                      placeholder="e.g. jdoe"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="e.g. john.doe@company.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Employee ID</label>
                    <input
                      type="text"
                      {...register('employee_num')}
                      placeholder="e.g. EMP-101"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Job Title</label>
                    <input
                      type="text"
                      {...register('jobtitle')}
                      placeholder="e.g. Product Designer"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Office Location</label>
                    <select
                      {...register('location_id')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      <option value="">Select Location...</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">User Role</label>
                    <select
                      {...register('role')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                    >
                      <option value="Staff">Staff / Employee</option>
                      <option value="admin">Administrator</option>
                      <option value="superadmin">Super Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="activated"
                    {...register('activated')}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/10"
                  />
                  <label htmlFor="activated" className="text-xs font-semibold text-slate-600 select-none cursor-pointer">
                    Enable & Activate User Login
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsCreateOpen(false); setEditingUser(null); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-700 transition-all"
                  >
                    {editingUser ? 'Save Changes' : 'Create Person'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAILED VIEW DIALOG --- */}
      <AnimatePresence>
        {detailedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-premium border border-slate-100 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                <img 
                  src={detailedUser.avatar || 'http://3.6.21.202:8000/uploads/default.png'} 
                  alt={detailedUser.name} 
                  className="h-14 w-14 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-800">{detailedUser.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">@{detailedUser.username} | {detailedUser.employee_num || 'No ID'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">Contact Details</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{detailedUser.email || 'No email registered'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span>{detailedUser.jobtitle || 'Staff'} • {detailedUser.role || 'User'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{detailedUser.location?.name || 'No assigned office location'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">Allocated Assets</h4>
                  {detailedUser.assets_count > 0 ? (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600">
                      This user has <span className="font-bold text-slate-800">{detailedUser.assets_count} assets</span> assigned to them.
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No active assets checked out.</p>
                  )}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-wide">License Assignments</h4>
                  {detailedUser.licenses_count > 0 ? (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600">
                      This user occupies <span className="font-bold text-slate-800">{detailedUser.licenses_count} software license seats</span>.
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No active license seats checked out.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-slate-100 mt-6">
                <button
                  onClick={() => setDetailedUser(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
