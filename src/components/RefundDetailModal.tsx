import React, { useState } from 'react';
import { 
  RefundRequest, 
  RefundStatus, 
  PayoutMethod 
} from '../types/refund';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Calculator, 
  Gift, 
  CreditCard, 
  ExternalLink,
  MessageSquare,
  Clock,
  Truck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RefundDetailModalProps {
  refund: RefundRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    refundId: string, 
    newStatus: RefundStatus, 
    decisionNotes: string, 
    financialOverrides?: {
      restockingFee: number;
      shippingRefund: number;
      netRefundAmount: number;
      payoutMethod: PayoutMethod;
    }
  ) => void;
}

export const RefundDetailModal: React.FC<RefundDetailModalProps> = ({
  refund,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !refund) return null;

  // Editable calculator state
  const [restockFeePercent, setRestockFeePercent] = useState<number>(
    refund.requestedSubtotal > 0 ? Math.round((refund.restockingFee / refund.requestedSubtotal) * 100) : 0
  );
  const [includeShippingRefund, setIncludeShippingRefund] = useState<boolean>(refund.shippingRefund > 0);
  const [customNotes, setCustomNotes] = useState<string>(refund.resolutionNotes || '');
  const [activePayout, setActivePayout] = useState<PayoutMethod>(refund.requestedPayoutMethod);

  // Dynamic calculations
  const subtotal = refund.requestedSubtotal;
  const restockFeeAmount = Number(((subtotal * restockFeePercent) / 100).toFixed(2));
  const shippingAmount = includeShippingRefund ? 8.50 : 0.00;
  const taxAmount = refund.taxRefund;
  const bonusMultiplier = activePayout === 'store_credit_bonus' ? 0.10 : 0;
  const bonusCredit = Number((subtotal * bonusMultiplier).toFixed(2));
  
  const calculatedTotal = Number(
    (subtotal - restockFeeAmount + taxAmount + shippingAmount + bonusCredit).toFixed(2)
  );

  const handleApprove = () => {
    onUpdateStatus(refund.id, 'settled', customNotes || 'Approved in full by Finance Operations.', {
      restockingFee: restockFeeAmount,
      shippingRefund: shippingAmount,
      netRefundAmount: calculatedTotal,
      payoutMethod: activePayout,
    });
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });
    onClose();
  };

  const handleReject = () => {
    onUpdateStatus(refund.id, 'rejected', customNotes || 'Refund request declined per 30-day policy limitations.', {
      restockingFee: 0,
      shippingRefund: 0,
      netRefundAmount: 0,
      payoutMethod: activePayout,
    });
    onClose();
  };

  const handleAuthorizeReturn = () => {
    onUpdateStatus(refund.id, 'in_transit', customNotes || 'RMA authorized. Awaiting physical carrier intake.', {
      restockingFee: restockFeeAmount,
      shippingRefund: shippingAmount,
      netRefundAmount: calculatedTotal,
      payoutMethod: activePayout,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">Refund Review #{refund.id.toUpperCase()}</span>
                <span className="font-mono text-xs text-slate-300">Order: {refund.orderNumber}</span>
              </div>
              <span className="text-xs text-slate-300">Customer: {refund.customerName} ({refund.customerEmail})</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Info Bar: Status & Fraud Risk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Status</div>
              <div className="text-xs font-bold text-slate-900 capitalize mt-0.5">
                {refund.status.replace('_', ' ')}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fraud Risk Score</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {refund.fraudRiskScore < 20 ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">{refund.fraudRiskScore} / 100 (Low Risk)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">{refund.fraudRiskScore} / 100 (Medium Risk)</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customer Tier</div>
              <div className="text-xs font-bold text-slate-900 uppercase mt-0.5">
                {refund.customerTier} Customer
              </div>
            </div>
          </div>

          {/* Requested Items */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Claimed Items & Evidence
            </div>
            <div className="space-y-2">
              {refund.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-300 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Reason: <span className="font-semibold text-slate-700 capitalize">{item.reason.replace('_', ' ')}</span>
                    </div>
                    {item.conditionNotes && (
                      <p className="text-xs text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-200">
                        "{item.conditionNotes}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${item.price.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Refund Calculator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Financial Settlement Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Controls Column */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-slate-700 mb-1 font-medium">
                    <span>Restocking Fee Deduction</span>
                    <span className="font-mono">{restockFeePercent}% (${restockFeeAmount.toFixed(2)})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="5"
                    value={restockFeePercent}
                    onChange={(e) => setRestockFeePercent(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Waived)</span>
                    <span>10% (Opened Goods)</span>
                    <span>25% (Heavy Goods)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-slate-700">Refund Shipping Fee ($8.50)</span>
                  <input
                    type="checkbox"
                    checked={includeShippingRefund}
                    onChange={(e) => setIncludeShippingRefund(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="pt-2">
                  <label className="block font-medium text-slate-700 mb-1">Disbursement Method</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePayout('store_credit_bonus')}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                        activePayout === 'store_credit_bonus' 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800' 
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      Store Credit (+10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePayout('original_payment')}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all ${
                        activePayout === 'original_payment' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800' 
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      Original Card
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Output Ledger */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Item Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sales Tax Refund:</span>
                  <span>+${taxAmount.toFixed(2)}</span>
                </div>
                {includeShippingRefund && (
                  <div className="flex justify-between text-slate-600">
                    <span>Original Shipping:</span>
                    <span>+${shippingAmount.toFixed(2)}</span>
                  </div>
                )}
                {restockFeeAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Restocking Deduction:</span>
                    <span>-${restockFeeAmount.toFixed(2)}</span>
                  </div>
                )}
                {activePayout === 'store_credit_bonus' && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>+10% Incentive Bonus:</span>
                    <span>+${bonusCredit.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Authorized Payout:</span>
                  <span>${calculatedTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Operational Decision Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Resolution Note / Audit Justification
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Approved with restock fee waiver due to high customer lifetime value"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline Claim</span>
            </button>

            {refund.status !== 'in_transit' && refund.returnMethod !== 'keep_item' && (
              <button
                onClick={handleAuthorizeReturn}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Issue Return RMA</span>
              </button>
            )}

            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Settlement (${calculatedTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
