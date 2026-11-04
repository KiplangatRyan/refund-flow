import React, { useState } from 'react';
import { GatewayEvent } from '../types/refund';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ExternalLink,
  Code2,
  RefreshCw
} from 'lucide-react';

interface GatewaySimulatorProps {
  events: GatewayEvent[];
  onTriggerSimulatedWebhook: (eventType: GatewayEvent['type']) => void;
}

export const GatewaySimulator: React.FC<GatewaySimulatorProps> = ({
  events,
  onTriggerSimulatedWebhook,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<GatewayEvent | null>(events[0] || null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Gateway & Webhook Stream</h1>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Gateway Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulates real-time Stripe Connect, Adyen, and Shopify payout settlement webhooks
          </p>
        </div>

        {/* Dispatch Trigger Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerSimulatedWebhook('charge.refunded')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate charge.refunded</span>
          </button>
          <button
            onClick={() => onTriggerSimulatedWebhook('dispute.opened')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Simulate dispute.opened</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Stream on Left, Payload on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Stream List */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Incoming Gateway Webhooks ({events.length})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">TLS 1.3 / HMAC SHA256</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/60 ring-1 ring-indigo-500/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {evt.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{evt.details}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">
                      Order: {evt.orderNumber} · Ref: #{evt.refundId}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${evt.amount.toFixed(2)} {evt.currency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Event JSON Inspector */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Event Payload Inspector</span>
            </div>
            {selectedEvent && (
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                HTTP 200 OK
              </span>
            )}
          </div>

          <div className="p-4 flex-1 font-mono text-xs overflow-x-auto">
            {selectedEvent ? (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify({
                  id: selectedEvent.id,
                  object: "event",
                  api_version: "2026-11-01",
                  created: Math.floor(new Date(selectedEvent.timestamp).getTime() / 1000),
                  data: {
                    object: {
                      id: `re_${selectedEvent.id.slice(-6)}`,
                      amount: Math.round(selectedEvent.amount * 100),
                      currency: selectedEvent.currency.toLowerCase(),
                      status: selectedEvent.status,
                      metadata: {
                        refund_flow_id: selectedEvent.refundId,
                        order_number: selectedEvent.orderNumber,
                        resolution: selectedEvent.details,
                      }
                    }
                  },
                  type: selectedEvent.type,
                }, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-500 py-12 text-center">
                Select an event from the stream to inspect raw JSON webhook payload.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
