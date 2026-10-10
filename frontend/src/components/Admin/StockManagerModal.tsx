/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Clock, ArrowDownRight, ArrowUpRight, RefreshCw, Check, ShoppingBag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { sortSizes } from '@/utils/sizeHelper';

interface StockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  initialSelectedSize?: string;
  onStockUpdated: (updatedProduct: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StockManagerModal: React.FC<StockManagerModalProps> = ({
  isOpen,
  onClose,
  product,
  initialSelectedSize,
  onStockUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'history'>('adjust');
  const [selectedSizeName, setSelectedSizeName] = useState<string>('');
  const [mode, setMode] = useState<'set' | 'restock'>('set');
  const [stockValue, setStockValue] = useState<number>(0);
  const [restockQty, setRestockQty] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // History state
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      const sorted = sortSizes(product.sizes);
      const match = initialSelectedSize 
        ? sorted.find((s: any) => (s.name || '').trim().toLowerCase() === initialSelectedSize.trim().toLowerCase()) 
        : null;
      const initial = match ? match.name : sorted[0].name;
      setSelectedSizeName(initial);
      const currentObj = sorted.find((s: any) => s.name === initial);
      setStockValue(currentObj ? currentObj.stock || 0 : 0);
    }
  }, [product, initialSelectedSize]);

  useEffect(() => {
    if (activeTab === 'history' && product) {
      fetchStockLogs();
    }
  }, [activeTab, selectedSizeName, product]);

  const currentSizeObj = product?.sizes?.find(
    (s: any) => (s.name || '').trim().toLowerCase() === (selectedSizeName || '').trim().toLowerCase()
  );

  const fetchStockLogs = async () => {
    if (!product) return;
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const sizeParam = selectedSizeName ? `?size=${encodeURIComponent(selectedSizeName)}` : '';
      const res = await fetch(`${API_URL}/admin/products/${product._id}/stock-logs${sizeParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch stock logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSelectSize = (name: string) => {
    setSelectedSizeName(name);
    const sizeObj = product?.sizes?.find((s: any) => s.name === name);
    if (sizeObj) {
      setStockValue(sizeObj.stock || 0);
    }
  };

  const handleSaveStock = async () => {
    if (!product || !selectedSizeName) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const payload: any = {
        sizeName: selectedSizeName,
        isRestock: mode === 'restock',
        note: note.trim()
      };

      if (mode === 'restock') {
        payload.addedQuantity = Number(restockQty);
      } else {
        payload.newStock = Number(stockValue);
      }

      const res = await fetch(`${API_URL}/admin/products/${product._id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Stock updated successfully!');
        onStockUpdated(data.product);
        setNote('');
        if (mode === 'restock') {
          setRestockQty(1);
        }
        // Refresh logs if history is opened
        fetchStockLogs();
      } else {
        toast.error(data.message || 'Failed to update stock');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" 
            />
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-1">
                {product.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Category: <span className="capitalize font-medium text-gray-700">{product.category}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 px-5 pt-3 gap-6 bg-white">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'adjust'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <RefreshCw size={15} />
            Quick Adjust & Restock
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock size={15} />
            Stock History Log
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Size Selector Bar */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
              Select Size:
            </label>
            <div className="flex flex-wrap gap-2">
              {sortSizes(product.sizes || []).map((size: any, idx: number) => {
                const isSelected = (size.name || '').trim().toLowerCase() === (selectedSizeName || '').trim().toLowerCase();
                const isOut = size.stock === 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSize(size.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : isOut
                        ? 'border-red-200 bg-red-50/60 text-red-700 hover:bg-red-100'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{size.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isOut
                        ? 'bg-red-200 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {size.stock} left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'adjust' ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Current Overview Badge */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 block">Selected Size:</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedSizeName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Current Available:</span>
                  <span className={`font-bold text-sm ${currentSizeObj?.stock === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {currentSizeObj?.stock ?? 0} units
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Baseline Received:</span>
                  <span className="font-semibold text-gray-700 text-sm">
                    {currentSizeObj?.initialStock ?? currentSizeObj?.stock ?? 0} units
                  </span>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  Action Type:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('set')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      mode === 'set'
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-400/20'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-gray-900 mb-1">
                      <RefreshCw size={14} className={mode === 'set' ? 'text-purple-600' : 'text-gray-400'} />
                      Set Exact Stock
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Direct physical correction (e.g., set to 1 after recount)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('restock')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      mode === 'restock'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/20'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-gray-900 mb-1">
                      <Plus size={14} className={mode === 'restock' ? 'text-emerald-600' : 'text-gray-400'} />
                      Restock Incoming (+)
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      Add new inventory from tailor/supplier
                    </p>
                  </button>
                </div>
              </div>

              {/* Input & Quick Helpers */}
              {mode === 'set' ? (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    New Current Stock Count:
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min="0"
                      value={stockValue}
                      onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 px-3 py-2 border rounded-lg text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 5, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setStockValue(val)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            stockValue === val 
                              ? 'bg-purple-100 border-purple-300 text-purple-700' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Will set available inventory for size <strong>{selectedSizeName}</strong> directly to {stockValue} units.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Units to Add to Stock:
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min="1"
                      value={restockQty}
                      onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-28 px-3 py-2 border rounded-lg text-base font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex gap-1.5">
                      {[1, 2, 5, 10, 20].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRestockQty(val)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            restockQty === val 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    New Available will become: <strong>{(currentSizeObj?.stock || 0) + Number(restockQty)}</strong> units (and baseline will automatically increase by +{restockQty}).
                  </p>
                </div>
              )}

              {/* Note / Memo */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Reason / Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder={mode === 'restock' ? 'e.g., Supplier shipment batch #3' : 'e.g., Physical box recount correction'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveStock}
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {mode === 'restock' ? `Confirm Restock (+${restockQty})` : `Save Stock (${stockValue} units)`}
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Stock History Tab */
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>Showing history for <strong>{selectedSizeName}</strong>:</span>
                <button 
                  onClick={fetchStockLogs} 
                  className="flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <RefreshCw size={12} className={logsLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {logsLoading ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-400" />
                  Loading stock timeline...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs border border-dashed rounded-xl p-6">
                  <Clock size={28} className="mx-auto mb-2 text-gray-300" />
                  No stock changes or purchases logged yet for size <strong>{selectedSizeName}</strong>.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log: any, idx: number) => {
                    const isOrder = log.reason === 'order';
                    const isRestock = log.reason === 'restock';
                    const isCancel = log.reason === 'order_cancelled';

                    return (
                      <div 
                        key={log._id || idx} 
                        className="border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-xs hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              isOrder
                                ? 'bg-red-100 text-red-600'
                                : isRestock
                                ? 'bg-emerald-100 text-emerald-600'
                                : isCancel
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {isOrder ? (
                                <ShoppingBag size={12} />
                              ) : isRestock ? (
                                <ArrowUpRight size={12} />
                              ) : isCancel ? (
                                <RefreshCw size={12} />
                              ) : (
                                <ArrowDownRight size={12} />
                              )}
                            </div>

                            <div>
                              <div className="font-semibold text-gray-800">
                                {isOrder ? (
                                  <span>Customer Purchase</span>
                                ) : isRestock ? (
                                  <span>New Inventory Restock</span>
                                ) : isCancel ? (
                                  <span>Order Cancelled (Stock Restored)</span>
                                ) : (
                                  <span>Manual Stock Adjustment</span>
                                )}
                              </div>
                              {log.orderNumber && (
                                <div className="text-[11px] font-mono text-gray-600 mt-0.5">
                                  Order #{log.orderNumber}
                                </div>
                              )}
                              {log.note && (
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  {log.note}
                                </div>
                              )}
                              <div className="text-[10px] text-gray-400 mt-1">
                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                              log.change < 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {log.change > 0 ? `+${log.change}` : log.change}
                            </span>
                            {log.newStock !== null && log.newStock !== undefined && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Balance: {log.newStock}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagerModal;
