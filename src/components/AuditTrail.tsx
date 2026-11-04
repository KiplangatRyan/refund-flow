import React, { useState } from 'react';
import { AuditLogEntry } from '../types/refund';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Bot, 
  Search, 
  ArrowDownToLine,
  Filter
} from 'lucide-react';

interface AuditTrailProps {
  logs: AuditLogEntry[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial & Security Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Immutable chronological record of automated policy actions and human finance overrides
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, order..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <span>Compliance Ledger ({filteredLogs.length} events)</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">SHA-256 Verified Sequence</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit records matched your filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      {log.actor.includes('Rule') || log.actor.includes('Engine') ? (
                        <Bot className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{log.action}</span>
                        {log.badge && (
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                            log.badge.toLowerCase().includes('auto')
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {log.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Actor: <strong className="text-slate-600 font-sans">{log.actor}</strong></span>
                        <span>·</span>
                        <span>Order: <strong className="text-slate-600">{log.orderNumber}</strong></span>
                        <span>·</span>
                        <span>Ref: #{log.refundId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
