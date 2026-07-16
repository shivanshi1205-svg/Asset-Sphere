import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Laptop, 
  Key, 
  Keyboard, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

import { assetService } from '../services/assetService';
import { licenseService } from '../services/licenseService';
import { accessoryService } from '../services/accessoryService';
import { consumableService } from '../services/consumableService';

const Dashboard = () => {
  // Query data
  const { data: assetsData } = useQuery({ queryKey: ['assets'], queryFn: () => assetService.getAssets() });
  const { data: licensesData } = useQuery({ queryKey: ['licenses'], queryFn: () => licenseService.getLicenses() });
  const { data: accessoriesData } = useQuery({ queryKey: ['accessories'], queryFn: () => accessoryService.getAccessories() });
  const { data: consumablesData } = useQuery({ queryKey: ['consumables'], queryFn: () => consumableService.getConsumables() });

  const totalAssets = assetsData?.total || 0;
  const totalLicenses = licensesData?.total || 0;
  const totalAccessories = accessoriesData?.total || 0;
  const totalConsumables = consumablesData?.total || 0;

  // Process Assets by Status for Pie Chart
  const statusCounts = {};
  assetsData?.rows?.forEach(asset => {
    const status = asset.status_label?.name || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const assetsByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Process Assets by Category for Bar Chart
  const categoryCounts = {};
  assetsData?.rows?.forEach(asset => {
    const category = asset.category?.name || 'Other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  const assetsByCategory = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  // Low Stock Items Warning
  const lowStockItems = [];
  accessoriesData?.rows?.forEach(acc => {
    if (acc.min_qty && acc.remaining <= acc.min_qty) {
      lowStockItems.push({ id: `acc-${acc.id}`, name: acc.name, type: 'Accessory', remaining: acc.remaining, min: acc.min_qty });
    }
  });
  consumablesData?.rows?.forEach(con => {
    if (con.min_qty && con.remaining <= con.min_qty) {
      lowStockItems.push({ id: `con-${con.id}`, name: con.name, type: 'Consumable', remaining: con.remaining, min: con.min_qty });
    }
  });

  // Recent Activities (Mocked Feed)
  const activities = [
    { id: 1, type: 'checkout', asset: 'Macbook Air (00002)', user: 'Awdhesh Soni', date: 'Just now' },
    { id: 2, type: 'checkin', asset: 'test1 (00001)', user: 'Noida Office', date: '2 hours ago' },
    { id: 3, type: 'checkout', license: 'Adobe Creative Cloud', user: 'DEMO Tenant', date: '1 day ago' },
    { id: 4, type: 'checkout', asset: 'Backhoe Loader (ICC-2065556)', user: 'Noida Office', date: '5 days ago' }
  ];

  // Recharts Colors
  const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Assets', val: totalAssets, icon: Laptop, color: 'bg-primary/10 text-primary', trend: '+2% from last week' },
          { label: 'Total Licenses', val: totalLicenses, icon: Key, color: 'bg-accent/10 text-accent', trend: '+1 new software added' },
          { label: 'Total Accessories', val: totalAccessories, icon: Keyboard, color: 'bg-sky-500/10 text-sky-600', trend: '85% stock level healthy' },
          { label: 'Total Consumables', val: totalConsumables, icon: Package, color: 'bg-indigo-500/10 text-indigo-600', trend: '2 items low in stock' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400">{kpi.label}</p>
                  <h3 className="font-display text-3xl font-bold text-slate-800 mt-1 tracking-tight">{kpi.val}</h3>
                </div>
                <div className={`rounded-xl p-3 ${kpi.color} transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Notifications Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Assets by Status - Pie Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:col-span-1">
          <h4 className="font-display text-base font-semibold text-slate-800 mb-6">Assets by Status</h4>
          <div className="h-64 flex flex-col justify-center items-center">
            {assetsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Assets`]} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No asset status data available</div>
            )}
          </div>
        </div>

        {/* Assets by Category - Bar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft lg:col-span-2">
          <h4 className="font-display text-base font-semibold text-slate-800 mb-6">Assets by Category</h4>
          <div className="h-64">
            {assetsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]}>
                    {assetsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'LAPTOP' ? '#2563EB' : '#0EA5E9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm flex h-full items-center justify-center">No asset category data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock & Activities Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Low Stock Alert Warnings */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h4 className="font-display text-base font-semibold text-slate-800">Low Stock Alert</h4>
          </div>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/20">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-700">{item.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                      {item.remaining} left
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Min threshold: {item.min}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Package className="h-8 w-8 text-slate-300 stroke-1 mb-2" />
                <p className="text-sm">All accessories and consumables stock levels are healthy.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Checkout Activities */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h4 className="font-display text-base font-semibold text-slate-800 mb-6">Recent Activity</h4>
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((act, actIdx) => (
                <li key={act.id}>
                  <div className="relative pb-8">
                    {actIdx !== activities.length - 1 && (
                      <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-10 w-10 rounded-xl flex items-center justify-center ring-8 ring-white ${
                          act.type === 'checkout' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          {act.type === 'checkout' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-slate-600 font-medium">
                            {act.type === 'checkout' ? 'Checked out ' : 'Checked in '}
                            <span className="font-semibold text-slate-800">{act.asset || act.license}</span> to{' '}
                            <span className="font-semibold text-slate-800">{act.user}</span>
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-xs text-slate-400">
                          <time>{act.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
