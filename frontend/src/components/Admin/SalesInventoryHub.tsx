/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Package, AlertOctagon, Download, Search, 
  RefreshCw, Clock, Flame, Award, SlidersHorizontal 
} from 'lucide-react';
import { toast } from 'sonner';

interface SalesInventoryHubProps {
  onOpenStockModal: (product: any, sizeName?: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalesInventoryHub: React.FC<SalesInventoryHubProps> = ({ onOpenStockModal }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // Filters
  const [activeFilter, setActiveFilter] = useState<'bestsellers' | 'slowmovers' | 'all' | 'lowstock'>('bestsellers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [timeRange]);

  const fetchInventoryAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/admin/inventory/analytics?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setProducts(data.products || []);
      } else {
        toast.error(data.message || 'Failed to load inventory analytics');
      }
    } catch (err) {
      console.error('Error fetching inventory analytics:', err);
      toast.error('Failed to load inventory sales data');
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesFilterType = true;
    if (activeFilter === 'bestsellers') {
      matchesFilterType = item.totalSold > 0;
    } else if (activeFilter === 'slowmovers') {
      matchesFilterType = item.totalSold === 0;
    } else if (activeFilter === 'lowstock') {
      matchesFilterType = item.totalStock <= 2;
    }

    return matchesSearch && matchesCategory && matchesFilterType;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error('No inventory data to export');
      return;
    }

    const headers = ['Rank', 'Product Name', 'Category', 'Subcategory', 'Price (INR)', 'Current Stock', 'Total Units Sold', 'Total Revenue (INR)', 'Top Selling Size'];
    const rows = products.map((p, idx) => [
      idx + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category || '',
      p.subcategory || '',
      p.price || 0,
      p.totalStock,
      p.totalSold,
      p.revenue || 0,
      `"${(p.topSize || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aazhi_inventory_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Inventory sales report exported to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              📊 Product Sales & Inventory Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              Live Hub
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time sales velocity, bestseller rankings, size demand breakdown, and dead-stock identification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">📅 All Time Sales</option>
            <option value="30d">🗓️ Last 30 Days</option>
            <option value="7d">⚡ Last 7 Days</option>
          </select>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchInventoryAnalytics}
            title="Refresh Analytics"
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Units Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Package size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total In Stock</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {summary.totalUnitsInStock.toLocaleString()} <span className="text-xs font-medium text-gray-500">units</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Across {summary.totalProductsCount} catalog items</p>
            </div>
          </div>

          {/* Total Retail Valuation Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Valuation</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
                ₹{summary.totalInventoryValue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Total retail rack value</p>
            </div>
          </div>

          {/* Top Selling Product Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">#1 Best Seller</p>
              <h3 className="text-base font-bold text-gray-900 mt-0.5 truncate" title={summary.topSellingProduct?.name}>
                {summary.topSellingProduct ? summary.topSellingProduct.name : 'No sales yet'}
              </h3>
              <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                {summary.topSellingProduct ? `🔥 ${summary.topSellingProduct.totalSold} units sold` : '-'}
              </p>
            </div>
          </div>

          {/* Out of Stock Alert Card */}
          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-100 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <AlertOctagon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl font-black text-red-600 mt-0.5">
                {summary.outOfStockCount} <span className="text-xs font-medium text-gray-500">products</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{summary.lowStockCount} items running low</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5 space-y-4">
        {/* Pills for Filter Type */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('bestsellers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeFilter === 'bestsellers'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Flame size={14} className={activeFilter === 'bestsellers' ? 'text-amber-300' : 'text-orange-500'} />
              🔥 Best Sellers First
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📦 All Catalog Items
            </button>

            <button
              onClick={() => setActiveFilter('slowmovers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'slowmovers'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🐢 Slow Movers (0 Sold)
            </button>

            <button
              onClick={() => setActiveFilter('lowstock')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'lowstock'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⚠️ Low Stock (&le; 2)
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredProducts.length}</strong> products
          </div>
        </div>

        {/* Search & Category Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 capitalize"
            >
              <option value="all">📂 All Categories</option>
              <option value="newborn">🍼 Newborn</option>
              <option value="boys">👦 Boys</option>
              <option value="girls">👧 Girls</option>
              <option value="unisex">⭐ Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Rank</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Top Selling Size</th>
                <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Available Stock</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-600" />
                    Calculating sales velocity and inventory performance...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                    No products found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, idx) => {
                  const isGold = idx === 0 && item.totalSold > 0;
                  const isSilver = idx === 1 && item.totalSold > 0;
                  const isBronze = idx === 2 && item.totalSold > 0;
                  const isOutOfStock = item.totalStock === 0;

                  return (
                    <tr key={item._id} className="hover:bg-purple-50/20 transition-colors">
                      {/* Rank Badge */}
                      <td className="px-4 py-3.5 text-center">
                        {isGold ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-white font-black text-xs inline-flex items-center justify-center shadow-sm">
                            🥇
                          </span>
                        ) : isSilver ? (
                          <span className="w-7 h-7 rounded-full bg-gray-300 text-gray-800 font-black text-xs inline-flex items-center justify-center shadow-sm">
                            🥈
                          </span>
                        ) : isBronze ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/80 text-white font-black text-xs inline-flex items-center justify-center shadow-sm">
                            🥉
                          </span>
                        ) : (
                          <span className="text-gray-400 font-bold">
                            #{idx + 1}
                          </span>
                        )}
                      </td>

                      {/* Product Image & Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0 shadow-xs" 
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                            {item.subcategory && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.subcategory}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-700">
                        {item.category}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        ₹{item.price?.toLocaleString()}
                      </td>

                      {/* Units Sold */}
                      <td className="px-4 py-3.5">
                        {item.totalSold > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-purple-100 text-purple-800 border border-purple-200/60 shadow-xs">
                            <Flame size={12} className="text-orange-500" />
                            {item.totalSold} sold
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">0 sold</span>
                        )}
                      </td>

                      {/* Top Selling Size */}
                      <td className="px-4 py-3.5">
                        {item.totalSold > 0 ? (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                            {item.topSize}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Available Stock */}
                      <td className="px-4 py-3.5">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                            🚫 0 left (Out of Stock)
                          </span>
                        ) : item.totalStock <= 2 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            ⚠️ {item.totalStock} left (Low)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ {item.totalStock} left in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenStockModal(item)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-xs flex items-center gap-1 ml-auto shadow-xs transition-colors"
                        >
                          <SlidersHorizontal size={12} />
                          Quick Restock / 🕒 Log
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesInventoryHub;
