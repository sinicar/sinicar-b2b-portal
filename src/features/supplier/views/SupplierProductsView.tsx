/**
 * SupplierProductsView - Products Management View for Supplier Portal
 * عرض إدارة المنتجات - بوابة المورد
 * 
 * Extracted from SupplierPortal.tsx - NO LOGIC CHANGES
 */

import React, { useState, memo } from 'react';
import { Search, Upload, Download, Plus, Package, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SupplierProduct, SupplierProductFilters } from '../../../types';

export interface SupplierProductsViewProps {
  products: SupplierProduct[];
  total: number;
  filters: SupplierProductFilters;
  onFiltersChange: (f: SupplierProductFilters) => void;
  onAdd: () => void;
  onEdit: (p: SupplierProduct) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
  onExport: () => void;
  t: (key: string) => string;
}

export const SupplierProductsView = memo(({
  products,
  total,
  filters,
  onFiltersChange,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  onExport,
  t
}: SupplierProductsViewProps) => {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({ ...filters, search, page: 1 });
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 20));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('supplier.searchProducts')}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              data-testid="input-search-products"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-search-products"
          >
            {t('search')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            data-testid="button-import-products"
          >
            <Upload size={18} />
            {t('supplier.import')}
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            data-testid="button-export-products"
          >
            <Download size={18} />
            {t('supplier.export')}
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-add-product"
          >
            <Plus size={18} />
            {t('supplier.addProduct')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">{t('supplier.noProducts')}</p>
            <p className="text-sm">{t('supplier.addFirstProduct')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.sku')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.productName')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.brand')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.price')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.stock')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.status')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors" data-testid={`product-row-${product.id}`}>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{product.sku}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.oemNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.brand}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">{product.purchasePrice.toLocaleString()} {t('currency')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {product.isActive ? t('supplier.active') : t('supplier.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('edit')}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('delete')}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              {t('showing')} {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} - {Math.min((filters.page || 1) * (filters.pageSize || 20), total)} {t('of')} {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={(filters.page || 1) <= 1}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-prev-page"
              >
                <ChevronRight size={18} />
              </button>
              <span className="px-3 py-1 bg-white rounded-lg border text-sm font-bold">
                {filters.page || 1} / {totalPages}
              </span>
              <button
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={(filters.page || 1) >= totalPages}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-next-page"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SupplierProductsView.displayName = 'SupplierProductsView';

export default SupplierProductsView;
