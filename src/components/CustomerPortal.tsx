import React, { useState } from 'react';
import { 
  Order, 
  OrderItem, 
  RefundReason, 
  PayoutMethod, 
  ReturnMethod, 
  RefundRequest 
} from '../types/refund';
import { 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Gift, 
  QrCode, 
  Truck, 
  Camera, 
  Info, 
  ShieldAlert, 
  ShoppingBag,
  ExternalLink,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerPortalProps {
  orders: Order[];
  onSubmitRefund: (refund: RefundRequest) => void;
  onViewInMerchantHub: (refundId: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  onSubmitRefund,
  onViewInMerchantHub,
}) => {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  
  // Selected Order
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [manualOrderNumber, setManualOrderNumber] = useState('');
  
  // Selected Item for Refund
  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([selectedOrder?.items[0]?.id || '']);
  
  // Reason & details
  const [reason, setReason] = useState<RefundReason>('defective_malfunction');
  const [notes, setNotes] = useState('Item stopped working properly after 2 days of normal use.');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    selectedOrder?.items[0]?.imageUrl || null
  );

  // Settlement Preferences
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('store_credit_bonus');
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>('qr_dropoff');

  // Completed submission
  const [submittedRefund, setSubmittedRefund] = useState<RefundRequest | null>(null);

  // Financial calculations
  const selectedItems = selectedOrder?.items.filter(item => selectedItemIds.includes(item.id)) || [];
  const requestedSubtotal = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const taxRate = selectedOrder?.tax && selectedOrder?.subtotal ? selectedOrder.tax / selectedOrder.subtotal : 0.08;
  const proportionalTax = Number((requestedSubtotal * taxRate).toFixed(2));
  const storeCreditBonusRate = 0.10; // 10%
  const bonusAmount = payoutMethod === 'store_credit_bonus' ? Number((requestedSubtotal * storeCreditBonusRate).toFixed(2)) : 0;
  const netRefundAmount = Number((requestedSubtotal + proportionalTax + bonusAmount).toFixed(2));

  const toggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      if (selectedItemIds.length > 1) {
        setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
      }
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    if (order.items.length > 0) {
      setSelectedItemIds([order.items[0].id]);
      setPhotoPreview(order.items[0].imageUrl);
    }
  };

  const handleSubmit = () => {
    const isSmallValue = requestedSubtotal <= 50;
    const isDefectiveOrDamaged = reason === 'damaged_arrival' || reason === 'defective_malfunction';
    
    // Auto-policy logic
    const willKeepItem = isSmallValue && isDefectiveOrDamaged;
    const finalReturnMethod: ReturnMethod = willKeepItem ? 'keep_item' : returnMethod;
    const finalStatus = willKeepItem || isSmallValue ? 'auto_approved' : 'needs_review';

    const newRefund: RefundRequest = {
      id: `ref_${Date.now().toString().slice(-4)}`,
      orderNumber: selectedOrder.orderNumber,
      orderId: selectedOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: selectedOrder.customerName,
      customerEmail: selectedOrder.customerEmail,
      customerTier: 'standard',
      fraudRiskScore: 12,
      items: selectedItems.map(item => ({
        orderItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        reason,
        conditionNotes: notes,
        photoUrl: photoPreview || item.imageUrl,
      })),
      requestedPayoutMethod: payoutMethod,
      returnMethod: finalReturnMethod,
      status: finalStatus,
      requestedSubtotal,
      taxRefund: proportionalTax,
      shippingRefund: 0,
      restockingFee: 0,
      storeCreditBonus: bonusAmount,
      netRefundAmount,
      trackingNumber: finalReturnMethod === 'keep_item' ? undefined : `USPS-9400-8819-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCodeToken: `RF-QR-${selectedOrder.orderNumber}-${Math.floor(1000 + Math.random() * 9000)}`,
      decisionBy: finalStatus === 'auto_approved' ? 'Automated Policy Engine' : undefined,
      decisionDate: finalStatus === 'auto_approved' ? new Date().toISOString() : undefined,
      resolutionNotes: finalStatus === 'auto_approved' 
        ? (willKeepItem ? 'Auto-approved under Keep-The-Item eco policy' : 'Instant micro-refund auto approved') 
        : 'Submitted for finance operations review',
    };

    setSubmittedRefund(newRefund);
    onSubmitRefund(newRefund);
    setStep(6);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Returns & Refunds Center</h1>
            <p className="text-sm text-slate-500">Fast, automated self-service returns with instant store credit incentives</p>
          </div>
          {step < 6 && (
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Step {step} of 5
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {step < 6 && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* STEP 1: ORDER LOOKUP */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Select or Enter an Order</h2>
            <p className="text-xs text-slate-500">Choose from recent eligible purchases or search by order number</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Eligible Recent Orders (Click to Select)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedOrderId === order.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-xs font-semibold text-slate-600">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mb-1">{order.customerName}</div>
                  <div className="text-[11px] text-slate-400">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · Purchased {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 truncate">
                    {order.items.map(i => i.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Selected Order: <span className="font-mono font-bold text-slate-900">{selectedOrder?.orderNumber}</span>
            </div>
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Continue with Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT ITEMS TO RETURN */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Select Items to Return</h2>
              <p className="text-xs text-slate-500">Order {selectedOrder.orderNumber} · Choose which products to include in this refund request</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {selectedItemIds.length} item(s) selected
            </span>
          </div>

          <div className="space-y-3">
            {selectedOrder.items.map(item => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent div
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">SKU: {item.sku} · Qty: {item.quantity}</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Eligible for return (30-day window)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${item.price.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-400">Paid price</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedItemIds.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Provide Reason</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REASON & EVIDENCE */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Why are you returning this?</h2>
            <p className="text-xs text-slate-500">Helping us understand helps resolve this request faster</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'defective_malfunction', label: 'Defective or Malfunction', desc: 'Item does not work as advertised or broke quickly' },
              { id: 'damaged_arrival', label: 'Damaged on Arrival', desc: 'Cracked, dented, or broken packaging in transit' },
              { id: 'wrong_item_shipped', label: 'Wrong Item Shipped', desc: 'Received different product or wrong color/variant' },
              { id: 'wrong_size_fit', label: 'Wrong Size or Fit', desc: 'Does not fit as expected' },
              { id: 'not_as_described', label: 'Not as Described', desc: 'Photos or specs differed from actual product' },
              { id: 'changed_mind', label: 'Changed Mind', desc: 'No longer needed or ordered by mistake' }
            ].map(r => (
              <div
                key={r.id}
                onClick={() => setReason(r.id as RefundReason)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  reason === r.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900">{r.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Details / Condition Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any issues or condition of the item..."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Simulated photo evidence upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Photo Evidence (Optional / Speeds up approval)
            </label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <div className="relative group">
                  <img
                    src={photoPreview}
                    alt="Evidence"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              )}
              <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center flex-1 bg-slate-50">
                <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-600 font-medium">Attach proof photos</span>
                <span className="text-[11px] text-slate-400 block">PNG, JPG, HEIC up to 10MB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Choose Refund Method</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYOUT & INCENTIVE METHOD */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">How would you like to be refunded?</h2>
            <p className="text-xs text-slate-500">Choose between immediate bonus credit or standard bank processing</p>
          </div>

          <div className="space-y-3">
            {/* Store Credit + 10% Bonus */}
            <div
              onClick={() => setPayoutMethod('store_credit_bonus')}
              className={`p-4 rounded-xl border cursor-pointer relative transition-all ${
                payoutMethod === 'store_credit_bonus'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Instant Store Credit</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        +10% Extra Bonus Credit!
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      No waiting for banks. Digital gift card code sent to your inbox immediately upon approval.
                    </p>
                    <div className="mt-2 text-xs font-semibold text-emerald-800">
                      Total Payout: ${requestedSubtotal.toFixed(2)} + ${bonusAmount.toFixed(2)} bonus = ${(requestedSubtotal + bonusAmount + proportionalTax).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">Immediate</span>
                </div>
              </div>
            </div>

            {/* Original Payment Method */}
            <div
              onClick={() => setPayoutMethod('original_payment')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                payoutMethod === 'original_payment'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Original Payment ({selectedOrder.paymentMethod.brand} ···· {selectedOrder.paymentMethod.last4})
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Credited directly back to your card. Takes 3–5 business days depending on your bank issuer.
                    </p>
                    <div className="mt-2 text-xs font-semibold text-slate-700">
                      Total Payout: ${(requestedSubtotal + proportionalTax).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500">3-5 days</span>
                </div>
              </div>
            </div>

            {/* Direct Replacement Exchange */}
            <div
              onClick={() => setPayoutMethod('direct_exchange')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                payoutMethod === 'direct_exchange'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Instant Replacement Exchange</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Dispatch a brand new replacement item to your address with priority express shipping.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500">Free Exchange</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Return Method</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: RETURN METHOD & CONFIRMATION */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">How will you return the item?</h2>
            <p className="text-xs text-slate-500">Select a convenient drop-off or pickup option</p>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setReturnMethod('qr_dropoff')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                returnMethod === 'qr_dropoff'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">No-Printer QR Code Drop-off (USPS / FedEx)</div>
                  <div className="text-[11px] text-slate-500">Just show the QR barcode on your smartphone at any drop-off counter.</div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Free Prepaid
                </span>
              </div>
            </div>

            <div
              onClick={() => setReturnMethod('courier_pickup')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                returnMethod === 'courier_pickup'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">Scheduled Front-Door Courier Pickup</div>
                  <div className="text-[11px] text-slate-500">Carrier will pick up box from your doorstep next business day.</div>
                </div>
              </div>
            </div>

            {/* If small value, highlight eco-friendly keep item */}
            {requestedSubtotal <= 50 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-semibold">Eco-Friendly Auto Exemption Qualified:</span> Because this item's value is under $50, our system may authorize you to keep or recycle the product without physical return shipping!
                </div>
              </div>
            )}
          </div>

          {/* Settlement Summary Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 pb-1 border-b border-slate-200">Refund Summary</div>
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({selectedItems.length})</span>
              <span>${requestedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax Refund</span>
              <span>${proportionalTax.toFixed(2)}</span>
            </div>
            {payoutMethod === 'store_credit_bonus' && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>+10% Store Credit Incentive</span>
                <span>+${bonusAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Refund Credit</span>
              <span>${netRefundAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Refund Request</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CONFIRMATION & LIVE RETURN RECEIPT */}
      {step === 6 && submittedRefund && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Refund Request Authorized!</h2>
            <p className="text-xs text-slate-500">
              Reference #{submittedRefund.id.toUpperCase()} · Order {submittedRefund.orderNumber}
            </p>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            submittedRefund.status === 'auto_approved' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold">
                  {submittedRefund.status === 'auto_approved' ? 'Instant Auto-Approval Granted' : 'Under Priority Review'}
                </div>
                <div className="text-[11px] opacity-80">
                  {submittedRefund.resolutionNotes}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 bg-white rounded border border-current">
              ${submittedRefund.netRefundAmount.toFixed(2)}
            </span>
          </div>

          {/* QR Code & Return Slip (if physical return required) */}
          {submittedRefund.returnMethod !== 'keep_item' ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Digital Return QR Code (USPS / FedEx)
              </div>
              <div className="w-40 h-40 bg-white border border-slate-300 rounded-xl mx-auto p-3 flex flex-col items-center justify-center shadow-xs">
                {/* SVG QR Code Simulation */}
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-slate-900 rounded">
                  <div className="bg-white col-span-2 row-span-2 rounded-xs"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white col-span-2 row-span-2 rounded-xs"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white col-span-2 row-span-2 rounded-xs"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white col-span-2 row-span-2 rounded-xs"></div>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-600">
                Tracking: {submittedRefund.trackingNumber}
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No printer required. Present this screen at any postal counter. The clerk will scan this code and attach the shipping label for you.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
              <strong>Eco-Policy Applied:</strong> You do not need to ship this item back. You may keep, donate, or recycle the item responsibly.
            </div>
          )}

          {/* Next Steps Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                setStep(1);
                setSubmittedRefund(null);
              }}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Submit Another Return
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Return Slip</span>
              </button>
              <button
                onClick={() => onViewInMerchantHub(submittedRefund.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              >
                <span>Inspect in Merchant Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
