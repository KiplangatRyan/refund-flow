export type RefundStatus = 
  | 'needs_review'
  | 'auto_approved'
  | 'in_transit'
  | 'inspected'
  | 'settled'
  | 'rejected'
  | 'dispute';

export type RefundReason = 
  | 'damaged_arrival'
  | 'defective_malfunction'
  | 'wrong_item_shipped'
  | 'wrong_size_fit'
  | 'not_as_described'
  | 'changed_mind'
  | 'arrived_late';

export type PayoutMethod = 
  | 'store_credit_bonus' // Instant credit + 10% bonus
  | 'original_payment'   // Visa, Mastercard, PayPal etc. (3-5 days)
  | 'direct_exchange';   // Direct item replacement

export type ReturnMethod = 
  | 'qr_dropoff'         // Drop off at USPS/FedEx with QR code
  | 'courier_pickup'     // Scheduled home pickup
  | 'keep_item';         // Eco-friendly / low-cost keep item

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
  eligibleForReturn: boolean;
  returnWindowDays: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: {
    brand: string;
    last4: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface RefundRequestItem {
  orderItemId: string;
  name: string;
  price: number;
  quantity: number;
  reason: RefundReason;
  conditionNotes?: string;
  photoUrl?: string;
}

export interface RefundRequest {
  id: string;
  userId?: string;
  orderNumber: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerTier: 'standard' | 'vip' | 'first_time';
  fraudRiskScore: number; // 0-100 (lower is safer)
  items: RefundRequestItem[];
  requestedPayoutMethod: PayoutMethod;
  returnMethod: ReturnMethod;
  status: RefundStatus;
  
  // Financial calculation
  requestedSubtotal: number;
  taxRefund: number;
  shippingRefund: number;
  restockingFee: number;
  storeCreditBonus: number;
  netRefundAmount: number;

  // Tracking & Fulfillment
  trackingNumber?: string;
  qrCodeToken?: string;
  resolutionNotes?: string;
  decisionBy?: 'Automated Policy Engine' | 'Finance Ops Team' | 'Escalations Manager';
  decisionDate?: string;
  gatewayTransactionId?: string;
}

export interface AutoPolicyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'auto_approve' | 'keep_item' | 'store_credit_bonus' | 'fraud_threshold' | 'return_window';
  conditions: {
    maxAmount?: number;
    maxFraudScore?: number;
    category?: string;
    daysSincePurchase?: number;
    bonusPercent?: number;
    freightRatioThreshold?: number;
  };
}

export interface GatewayEvent {
  id: string;
  type: 'charge.refunded' | 'refund.created' | 'dispute.opened' | 'credit.issued' | 'exchange.dispatched';
  timestamp: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
  refundId: string;
  orderNumber: string;
  details: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  refundId: string;
  orderNumber: string;
  details: string;
  badge?: string;
}
