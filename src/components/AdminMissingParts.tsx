import React, { useState, useMemo } from 'react';
import { MissingProductRequest, MissingStatus, MissingSource } from '../types';
import Api from '../services/api';
import { 
    Search, Filter, Database, FileText, Calendar, 
    Download, ChevronRight, ChevronLeft, Eye, 
    X, Save, CheckCircle, Clock, ShoppingCart, 
    PackagePlus, Archive, UserCheck, AlertCircle 
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { useTranslation } from 'react-i18next';

interface AdminMissingPartsProps {
    missingRequests: MissingProductRequest[];
}

const STATUS_KEYS: Record<MissingStatus, string> = {
    'NEW': 'new',
    'UNDER_REVIEW': 'underReview',
    'ORDER_PLANNED': 'orderPlanned',
    'ORDERED': 'ordered',
    'ADDED_TO_STOCK': 'addedToStock',
    'IGNORED': 'ignored'
};

const STATUS_COLORS: Record<MissingStatus, string> = {
    'NEW': 'bg-blue-50 text-blue-700 border-blue-200',
    'UNDER_REVIEW': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'ORDER_PLANNED': 'bg-purple-50 text-purple-700 border-purple-200',
    'ORDERED': 'bg-orange-50 text-orange-700 border-orange-200',
    'ADDED_TO_STOCK': 'bg-green-50 text-green-700 border-green-200',
    'IGNORED': 'bg-gray-50 text-gray-500 border-gray-200'
};

export const AdminMissingParts: React.FC<AdminMissingPartsProps> = ({ missingRequests }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'ALL' | 'SEARCH' | 'QUOTE'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<MissingProductRequest | null>(null);
    const [editForm, setEditForm] = useState<{status: MissingStatus; adminNotes: string}>({ status: 'NEW', adminNotes: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const { addToast } = useToast();
    
    const getStatusLabel = (status: MissingStatus): string => {
        const key = STATUS_KEYS[status];
        return key ? t(`adminMissingParts.status.${key}`) : status;
    };

    // Stats Calculation
    const stats = useMemo(() => ({
        total: missingRequests.length,
        new: missingRequests.filter(r => r.status === 'NEW' || !r.status).length,
        inReview: missingRequests.filter(r => r.status === 'UNDER_REVIEW').length,
        ordered: missingRequests.filter(r => r.status === 'ORDERED' || r.status === 'ORDER_PLANNED').length,
        solved: missingRequests.filter(r => r.status === 'ADDED_TO_STOCK').length,
        fromQuote: missingRequests.filter(r => r.source === 'QUOTE').length,
        fromSearch: missingRequests.filter(r => r.source === 'SEARCH').length
    }), [missingRequests]);

    // Filtering & Sorting
    const filteredRequests = useMemo(() => {
        let res = [...missingRequests];
        
        // Tab Filter
        if (activeTab !== 'ALL') {
            res = res.filter(req => (req.source || 'SEARCH') === activeTab);
        }

        // Text Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(r => 
                r.query.toLowerCase().includes(lower) || 
                (r.partNumber || '').toLowerCase().includes(lower) ||
                (r.name || '').toLowerCase().includes(lower)
            );
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
            res = res.filter(r => (r.status || 'NEW') === statusFilter);
        }

        // Sort: Priority to High Request Count, then Date
        return res.sort((a, b) => {
            const countDiff = (b.totalRequestsCount || 1) - (a.totalRequestsCount || 1);
            if (countDiff !== 0) return countDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [missingRequests, activeTab, searchTerm, statusFilter]);

    // Pagination Logic
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

    // Handlers
    const handleViewDetails = (req: MissingProductRequest) => {
        setSelectedRequest(req);
        setEditForm({
            status: req.status || 'NEW',
            adminNotes: req.adminNotes || ''
        });
    };

    const handleSaveStatus = async () => {
        if (!selectedRequest) return;
        setIsSaving(true);
        try {
            await Api.updateMissingProductStatus(selectedRequest.id, editForm.status, editForm.adminNotes);
            addToast(t('adminMissingParts.toast.statusUpdated'), 'success');
            // Optimistic update
            selectedRequest.status = editForm.status;
            selectedRequest.adminNotes = editForm.adminNotes;
            setSelectedRequest(null); // Close panel
        } catch (e) {
            addToast(t('adminMissingParts.toast.saveError'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const { utils, writeFile } = await import('xlsx');
            const data = filteredRequests.map(r => ({
                [t('adminMissingParts.export.partNumber')]: r.normalizedPartNumber || r.query,
                [t('adminMissingParts.export.itemName')]: r.name || r.query,
                [t('adminMissingParts.export.source')]: r.source === 'QUOTE' ? t('adminMissingParts.source.quote') : t('adminMissingParts.source.search'),
                [t('adminMissingParts.export.requestCount')]: r.totalRequestsCount || 1,
                [t('adminMissingParts.export.customerCount')]: r.uniqueCustomersCount || 1,
                [t('adminMissingParts.export.status')]: getStatusLabel(r.status || 'NEW'),
                [t('adminMissingParts.export.lastRequest')]: formatDateTime(r.lastRequestedAt || r.createdAt),
                [t('adminMissingParts.export.adminNotes')]: r.adminNotes || ''
            }));

            const ws = utils.json_to_sheet(data);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Missing Items");
            writeFile(wb, "Missing_Parts_Report.xlsx");
            addToast(t('adminMissingParts.toast.exportSuccess'), 'success');
        } catch (e) {
            addToast(t('adminMissingParts.toast.exportFailed'), 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.stats.totalMissing')}</p>
                    <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.stats.newMissing')}</p>
                    <p className="text-2xl font-black text-blue-600">{stats.new}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.stats.underReview')}</p>
                    <p className="text-2xl font-black text-yellow-600">{stats.inReview}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.stats.orderedImport')}</p>
                    <p className="text-2xl font-black text-purple-600">{stats.ordered}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.stats.addedToStock')}</p>
                    <p className="text-2xl font-black text-green-600">{stats.solved}</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('ALL')}
                        className={`px-5 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t('adminMissingParts.tabs.all')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('QUOTE')}
                        className={`px-5 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'QUOTE' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={16} /> {t('adminMissingParts.tabs.fromQuote')} ({stats.fromQuote})
                    </button>
                    <button 
                        onClick={() => setActiveTab('SEARCH')}
                        className={`px-5 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'SEARCH' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Search size={16} /> {t('adminMissingParts.tabs.fromSearch')} ({stats.fromSearch})
                    </button>
                </div>

                {/* Filters & Export */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('adminMissingParts.searchPlaceholder')} 
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">{t('adminMissingParts.allStatuses')}</option>
                        {Object.keys(STATUS_KEYS).map(key => (
                            <option key={key} value={key}>{getStatusLabel(key as MissingStatus)}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Excel
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">{t('adminMissingParts.table.partNumber')}</th>
                            <th className="p-4 text-center">{t('adminMissingParts.table.source')}</th>
                            <th className="p-4 text-center">{t('adminMissingParts.table.requestFrequency')}</th>
                            <th className="p-4 text-center">{t('adminMissingParts.table.interestedCustomers')}</th>
                            <th className="p-4 text-center">{t('adminMissingParts.table.status')}</th>
                            <th className="p-4">{t('adminMissingParts.table.lastRequest')}</th>
                            <th className="p-4 text-center">{t('adminMissingParts.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono font-bold text-brand-700 text-base">{req.normalizedPartNumber || req.query}</span>
                                        {req.name && req.name !== req.query && (
                                            <span className="text-xs text-slate-500 mt-0.5">{req.name}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${req.source === 'QUOTE' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {req.source === 'QUOTE' ? t('adminMissingParts.source.quote') : t('adminMissingParts.source.search')}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="font-black text-slate-800 text-lg">{req.totalRequestsCount || 1}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-600 font-bold">
                                        <UserCheck size={14} /> {req.uniqueCustomersCount || 1}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${STATUS_COLORS[req.status || 'NEW']}`}>
                                        {getStatusLabel(req.status || 'NEW')}
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono text-slate-500" dir="ltr">
                                    {formatDateTime(req.lastRequestedAt || req.createdAt)}
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleViewDetails(req)}
                                        className="text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                    >
                                        <Eye size={16} /> {t('adminMissingParts.actions.details')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedRequests.length === 0 && (
                            <tr><td colSpan={7} className="p-16 text-center text-slate-400 font-bold">{t('adminMissingParts.noMatchingMissing')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-600">{t('adminMissingParts.pagination.page')} {currentPage} {t('adminMissingParts.pagination.of')} {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            )}

            {/* --- SLIDE-OVER DETAIL PANEL --- */}
            {selectedRequest && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)}></div>
                    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-200 flex flex-col">
                        
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{t('adminMissingParts.panel.missingDetails')}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Main Info */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="mb-4">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.panel.requestedItem')}</span>
                                    <span className="block text-2xl font-black text-brand-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                                        {selectedRequest.normalizedPartNumber || selectedRequest.query}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.panel.suggestedName')}</span>
                                        <span className="font-bold text-slate-800">{selectedRequest.name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">{t('adminMissingParts.panel.brand')}</span>
                                        <span className="font-bold text-slate-800">{selectedRequest.brand || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                    <p className="text-2xl font-black text-blue-600">{selectedRequest.totalRequestsCount || 1}</p>
                                    <p className="text-xs font-bold text-blue-400 uppercase">{t('adminMissingParts.panel.requestCount')}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                    <p className="text-2xl font-black text-purple-600">{selectedRequest.uniqueCustomersCount || 1}</p>
                                    <p className="text-xs font-bold text-purple-400 uppercase">{t('adminMissingParts.panel.differentCustomers')}</p>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="bg-[#0B1B3A] p-6 rounded-2xl border border-slate-700 shadow-lg text-white space-y-4">
                                <h4 className="font-bold text-[#C8A04F] flex items-center gap-2 border-b border-slate-700 pb-2">
                                    <AlertCircle size={18} /> {t('adminMissingParts.panel.followUp')}
                                </h4>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminMissingParts.panel.updateStatus')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold focus:ring-1 focus:ring-[#C8A04F]"
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value as MissingStatus})}
                                    >
                                        {Object.keys(STATUS_KEYS).map(key => (
                                            <option key={key} value={key}>{getStatusLabel(key as MissingStatus)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminMissingParts.panel.internalNotes')}</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:border-[#C8A04F] focus:outline-none"
                                        placeholder={t('adminMissingParts.panel.notesPlaceholder')}
                                        value={editForm.adminNotes}
                                        onChange={(e) => setEditForm({...editForm, adminNotes: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button 
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg border border-white/10 flex items-center justify-center gap-2"
                                        onClick={() => addToast(t('adminMissingParts.toast.linkImportSoon'), 'info')}
                                    >
                                        <PackagePlus size={14} /> {t('adminMissingParts.actions.linkToImport')}
                                    </button>
                                    <button 
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg border border-white/10 flex items-center justify-center gap-2"
                                        onClick={() => addToast(t('adminMissingParts.toast.redirectToAddProduct'), 'info')}
                                    >
                                        <Archive size={14} /> {t('adminMissingParts.actions.addToStock')}
                                    </button>
                                </div>
                            </div>

                            {/* Reference Info */}
                            {selectedRequest.source === 'QUOTE' && (
                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                                    <p className="font-bold mb-1">{t('adminMissingParts.panel.sourceQuote')}</p>
                                    <p className="font-mono">Ref ID: {selectedRequest.quoteRequestId}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t border-slate-200 shadow-up z-10 flex gap-4">
                            <button 
                                onClick={handleSaveStatus}
                                disabled={isSaving}
                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                <Save size={18} /> {isSaving ? t('adminMissingParts.actions.saving') : t('adminMissingParts.actions.saveChanges')}
                            </button>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};