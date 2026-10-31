/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  History, Search, RefreshCw, Laptop, User, Phone, 
  ShoppingBag, ArrowUpRight, ArrowDownRight, Edit3, Filter, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';

interface StockAuditLogProps {
  onOpenProductModal?: (product: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockAuditLog: React.FC<StockAuditLogProps> = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [reasonFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (reasonFilter !== 'all') params.append('reason', reasonFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', '150');

      const res = await fetch(`${API_URL}/admin/inventory/stock-ledger?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        toast.error(data.message || 'Failed to load stock audit ledger');
      }
    } catch (err) {
      console.error('Error fetching stock ledger:', err);
      toast.error('Failed to connect to stock audit server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.productName || '').toLowerCase().includes(q) ||
      (log.size || '').toLowerCase().includes(q) ||
      (log.deviceName || '').toLowerCase().includes(q) ||
      (log.performedBy || '').toLowerCase().includes(q) ||
      (log.orderNumber || '').toLowerCase().includes(q) ||
      (log.note || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <History className="text-primary" size={26} />
            Stock & Product Edit Activity
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete audit trail of every stock change, Edit Product modal update, and online customer purchase.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search product, size, laptop, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="all">All Activity Types</option>
            <option value="product_edit">✏️ Edit Product Modal Changes</option>
            <option value="order">🛒 Online Customer Purchases</option>
            <option value="restock">📦 Restocks (+Qty)</option>
            <option value="manual_adjustment">⚙️ Manual Adjustments</option>
            <option value="order_cancelled">🔄 Order Cancelled (Restores)</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-primary" />
            Loading store stock activity...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs p-6">
            <History size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600 text-sm">No activity records found</p>
            <p className="text-gray-400 mt-1">Changes made in the Edit Product modal or new orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Product & Size</th>
                  <th className="px-5 py-3.5">Action Type</th>
                  <th className="px-5 py-3.5">Device / Laptop</th>
                  <th className="px-5 py-3.5">Who Did It</th>
                  <th className="px-5 py-3.5">Stock Change</th>
                  <th className="px-5 py-3.5">Details / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log: any, idx: number) => {
                  const isOrder = log.reason === 'order';
                  const isEdit = log.reason === 'product_edit';
                  const isRestock = log.reason === 'restock';
                  const isCancel = log.reason === 'order_cancelled';

                  return (
                    <tr key={log._id || idx} className="hover:bg-gray-50/60 transition-colors">
                      {/* Date & Time */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-medium text-[11px]">
                        <div>{new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Product & Size */}
                      <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs">
                        <div className="font-bold text-gray-900 truncate" title={log.productName}>
                          {log.productName || 'Unnamed Product'}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold border border-gray-200">
                          Size: {log.size || 'N/A'}
                        </span>
                      </td>

                      {/* Action Type Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isEdit ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                            <Edit3 size={11} />
                            Edit Product Modal
                          </span>
                        ) : isOrder ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            <ShoppingBag size={11} />
                            Customer Order
                          </span>
                        ) : isRestock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <ArrowUpRight size={11} />
                            Restock
                          </span>
                        ) : isCancel ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            <RefreshCw size={11} />
                            Order Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <ArrowDownRight size={11} />
                            Manual Adjust
                          </span>
                        )}
                      </td>

                      {/* Device / Laptop */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          <Laptop size={12} className="text-primary" />
                          {log.deviceName || (isOrder ? 'Online Store' : 'Web Admin')}
                        </span>
                      </td>

                      {/* Who Did It */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isOrder ? (
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1">
                              <User size={12} className="text-gray-400" />
                              {log.customerDetails?.name || log.performedBy || 'Online Shopper'}
                            </div>
                            {log.customerDetails?.phone && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                {log.customerDetails.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-700 font-semibold">
                            <User size={12} className="text-primary" />
                            {log.performedBy || 'Staff Admin'}
                          </div>
                        )}
                      </td>

                      {/* Stock Change */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${
                          log.change < 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : log.change > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {log.change > 0 ? `+${log.change}` : log.change} units
                        </span>
                        {log.previousStock !== null && log.previousStock !== undefined && log.newStock !== null && log.newStock !== undefined && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Stock: {log.previousStock} → {log.newStock}
                          </div>
                        )}
                        {log.initialStockChange && log.initialStockChange.previous !== null && log.initialStockChange.current !== null && (
                          <div className="text-[10px] text-blue-600 font-medium">
                            Initial: {log.initialStockChange.previous} → {log.initialStockChange.current}
                          </div>
                        )}
                      </td>

                      {/* Details / Note */}
                      <td className="px-5 py-3.5 max-w-sm text-gray-600">
                        {log.orderNumber && (
                          <div className="font-mono text-[11px] font-semibold text-primary mb-0.5">
                            Order #{log.orderNumber}
                          </div>
                        )}
                        <div className="truncate text-xs" title={log.note}>
                          {log.note || '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAuditLog;
