import React, { useState } from 'react';
import { 
  RefundRequest, 
  RefundStatus 
} from '../types/refund';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Gift, 
  CreditCard,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface MerchantDashboardProps {
  refunds: RefundRequest[];
  onSelectRefund: (refund: RefundRequest) => void;
  onQuickApprove: (refundId: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  refunds,
  onSelectRefund,
  onQuickApprove,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const totalVolume = refunds.reduce((acc, r) => acc + r.netRefundAmount, 0);
  const pendingCount = refunds.filter(r => r.status === 'needs_review').length;
  const autoApprovedCount = refunds.filter(r => r.status === 'auto_approved').length;
  const settledCount = refunds.filter(r => r.status === 'settled').length;
  const autoRate = refunds.length > 0 ? Math.round(((autoApprovedCount + settledCount) / refunds.length) * 100) : 0;

  // Filtered requests
  const filteredRefunds = refunds.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = 
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Refund ID', 'Order Number', 'Date', 'Customer', 'Items', 'Status', 'Net Amount', 'Payout Method', 'Fraud Score', 'Decision By'];
    const rows = refunds.map(r => [
      r.id,
      r.orderNumber,
      r.createdAt,
      `"${r.customerName}"`,
      `"${r.items.map(i => i.name).join('; ')}"`,
      r.status,
      r.netRefundAmount.toFixed(2),
      r.requestedPayoutMethod,
      r.fraudRiskScore,
      `"${r.decisionBy || 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `refundflow-settlements-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'needs_review':
        return <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Needs Review</span>;
      case 'auto_approved':
        return <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Auto-Approved</span>;
      case 'in_transit':
        return <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">In Transit</span>;
      case 'settled':
        return <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">Settled</span>;
      case 'rejected':
        return <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Rejected</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Operations & Dispute Hub</h1>
          <p className="text-xs text-slate-500">Autonomous policy execution, RMA tracking, and financial reconciliation</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export CSV Settlement Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Claim Volume</span>
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">${totalVolume.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-700">{refunds.length}</span> total claims filed
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Awaiting Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Requires manager authorization
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Automation Yield</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{autoRate}%</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Handled by rules with 0 friction
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Settled / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{settledCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Credited via Gateway
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Requests', count: refunds.length },
              { id: 'needs_review', label: 'Needs Review', count: pendingCount },
              { id: 'auto_approved', label: 'Auto-Approved', count: autoApprovedCount },
              { id: 'in_transit', label: 'In Transit', count: refunds.filter(r => r.status === 'in_transit').length },
              { id: 'settled', label: 'Settled', count: settledCount },
              { id: 'rejected', label: 'Rejected', count: refunds.filter(r => r.status === 'rejected').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, SKU..."
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
          </div>

        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Order / ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items & Reason</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Disbursement</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No refund requests found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map(refund => (
                  <tr 
                    key={refund.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectRefund(refund)}
                  >
                    {/* Order / Ref */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{refund.orderNumber}</div>
                      <div className="text-[11px] text-slate-400">#{refund.id}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{refund.customerName}</div>
                      <div className="text-[11px] text-slate-400">{refund.customerEmail}</div>
                    </td>

                    {/* Items & Reason */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="truncate font-medium text-slate-800">
                        {refund.items.map(i => i.name).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {refund.items[0]?.reason.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Fraud Risk */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {refund.fraudRiskScore < 20 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{refund.fraudRiskScore}/100</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{refund.fraudRiskScore}/100</span>
                        </span>
                      )}
                    </td>

                    {/* Disbursement */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {refund.requestedPayoutMethod === 'store_credit_bonus' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <Gift className="w-3.5 h-3.5" />
                          <span>Store Credit (+10%)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Original Card</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      ${refund.netRefundAmount.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(refund.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {refund.status === 'needs_review' && (
                          <button
                            onClick={() => onQuickApprove(refund.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => onSelectRefund(refund)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
