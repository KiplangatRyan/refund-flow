import { Order, RefundRequest, AutoPolicyRule, GatewayEvent, AuditLogEntry } from '../types/refund';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'ORD-84920',
    orderDate: '2026-10-24T14:30:00Z',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    items: [
      {
        id: 'item_101_1',
        name: 'AcousticPro Studio Noise-Cancelling Headphones',
        sku: 'AUDIO-HP-099',
        price: 249.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        category: 'Electronics',
        eligibleForReturn: true,
        returnWindowDays: 30,
      },
      {
        id: 'item_101_2',
        name: 'Braided Audio 3.5mm Aux Cable (Gold-Plated)',
        sku: 'ACC-CBL-35G',
        price: 19.99,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
        category: 'Accessories',
        eligibleForReturn: true,
        returnWindowDays: 30,
      }
    ],
    subtotal: 268.99,
    shipping: 0.00,
    tax: 21.52,
    total: 290.51,
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
    },
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'USA',
    }
  },
  {
    id: 'ord_102',
    orderNumber: 'ORD-91042',
    orderDate: '2026-10-28T09:15:00Z',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@finch.io',
    items: [
      {
        id: 'item_102_1',
        name: 'Aerolite Merino Wool Travel Jacket',
        sku: 'APP-MJKT-BLK-L',
        price: 185.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
        category: 'Apparel',
        eligibleForReturn: true,
        returnWindowDays: 30,
      }
    ],
    subtotal: 185.00,
    shipping: 8.50,
    tax: 14.80,
    total: 208.30,
    paymentMethod: {
      brand: 'Mastercard',
      last4: '8812',
    },
    shippingAddress: {
      street: '120 Market St, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    }
  },
  {
    id: 'ord_103',
    orderNumber: 'ORD-38192',
    orderDate: '2026-10-15T18:45:00Z',
    customerName: 'Sophia Chen',
    customerEmail: 'sophia.chen@northtech.co',
    items: [
      {
        id: 'item_103_1',
        name: 'Ergonomic Mechanical Keyboard (Linear Switches)',
        sku: 'TECH-KB-MEC88',
        price: 139.00,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
        category: 'Electronics',
        eligibleForReturn: true,
        returnWindowDays: 30,
      },
      {
        id: 'item_103_2',
        name: 'Memory Foam Wrist Rest - Charcoal',
        sku: 'ACC-WR-CH',
        price: 24.50,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80',
        category: 'Accessories',
        eligibleForReturn: true,
        returnWindowDays: 30,
      }
    ],
    subtotal: 163.50,
    shipping: 0.00,
    tax: 13.08,
    total: 176.58,
    paymentMethod: {
      brand: 'Apple Pay',
      last4: '1099',
    },
    shippingAddress: {
      street: '450 5th Ave',
      city: 'Seattle',
      state: 'WA',
      zip: '98104',
      country: 'USA',
    }
  },
  {
    id: 'ord_104',
    orderNumber: 'ORD-55419',
    orderDate: '2026-10-30T11:20:00Z',
    customerName: 'David K. Miller',
    customerEmail: 'david.miller@apexcorp.com',
    items: [
      {
        id: 'item_104_1',
        name: 'Titanium Thermal Travel Tumbler (24oz)',
        sku: 'HOME-TUMB-24TI',
        price: 42.00,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
        category: 'Home & Kitchen',
        eligibleForReturn: true,
        returnWindowDays: 30,
      }
    ],
    subtotal: 84.00,
    shipping: 6.00,
    tax: 6.72,
    total: 96.72,
    paymentMethod: {
      brand: 'Visa',
      last4: '9031',
    },
    shippingAddress: {
      street: '88 Lincoln Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA',
    }
  }
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: 'ref_001',
    orderNumber: 'ORD-84920',
    orderId: 'ord_101',
    createdAt: '2026-11-01T10:14:00Z',
    updatedAt: '2026-11-01T10:15:30Z',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerTier: 'vip',
    fraudRiskScore: 6, // Very safe
    items: [
      {
        orderItemId: 'item_101_1',
        name: 'AcousticPro Studio Noise-Cancelling Headphones',
        price: 249.00,
        quantity: 1,
        reason: 'defective_malfunction',
        conditionNotes: 'Right earbud has periodic static noise when ANC is turned on.',
        photoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      }
    ],
    requestedPayoutMethod: 'store_credit_bonus',
    returnMethod: 'qr_dropoff',
    status: 'auto_approved',
    requestedSubtotal: 249.00,
    taxRefund: 19.92,
    shippingRefund: 0.00,
    restockingFee: 0.00,
    storeCreditBonus: 24.90, // +10% bonus
    netRefundAmount: 293.82,
    trackingNumber: 'USPS-9400-1118-9922-3819-01',
    qrCodeToken: 'RF-TOKEN-84920-QR',
    decisionBy: 'Automated Policy Engine',
    decisionDate: '2026-11-01T10:15:30Z',
    gatewayTransactionId: 'gw_cred_993410',
    resolutionNotes: 'Instant store credit issued (+10% VIP bonus). Return shipping label generated.',
  },
  {
    id: 'ref_002',
    orderNumber: 'ORD-91042',
    orderId: 'ord_102',
    createdAt: '2026-11-02T16:40:00Z',
    updatedAt: '2026-11-02T17:10:00Z',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@finch.io',
    customerTier: 'standard',
    fraudRiskScore: 14,
    items: [
      {
        orderItemId: 'item_102_1',
        name: 'Aerolite Merino Wool Travel Jacket',
        price: 185.00,
        quantity: 1,
        reason: 'wrong_size_fit',
        conditionNotes: 'Ordered Large, but sleeves are a bit too snug. Item in original packaging with tags intact.',
        photoUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
      }
    ],
    requestedPayoutMethod: 'original_payment',
    returnMethod: 'qr_dropoff',
    status: 'in_transit',
    requestedSubtotal: 185.00,
    taxRefund: 14.80,
    shippingRefund: 0.00,
    restockingFee: 0.00,
    storeCreditBonus: 0.00,
    netRefundAmount: 199.80,
    trackingNumber: 'FEDEX-7782-9901-4451',
    qrCodeToken: 'RF-TOKEN-91042-QR',
    decisionBy: 'Finance Ops Team',
    decisionDate: '2026-11-02T17:10:00Z',
    resolutionNotes: 'Customer shipped package from San Francisco hub. Awaiting physical dock inspection.',
  },
  {
    id: 'ref_003',
    orderNumber: 'ORD-38192',
    orderId: 'ord_103',
    createdAt: '2026-11-03T11:20:00Z',
    updatedAt: '2026-11-03T11:20:00Z',
    customerName: 'Sophia Chen',
    customerEmail: 'sophia.chen@northtech.co',
    customerTier: 'standard',
    fraudRiskScore: 42,
    items: [
      {
        orderItemId: 'item_103_1',
        name: 'Ergonomic Mechanical Keyboard (Linear Switches)',
        price: 139.00,
        quantity: 1,
        reason: 'changed_mind',
        conditionNotes: 'Box was opened and plugged in once. Prefers tactile switch switches.',
        photoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
      }
    ],
    requestedPayoutMethod: 'original_payment',
    returnMethod: 'qr_dropoff',
    status: 'needs_review',
    requestedSubtotal: 139.00,
    taxRefund: 11.12,
    shippingRefund: 0.00,
    restockingFee: 13.90, // 10% restocking fee for opened electronics
    storeCreditBonus: 0.00,
    netRefundAmount: 136.22,
    resolutionNotes: 'Opened electronics return past 14 days. Requires manager review for restocking fee waiver or RMA approval.',
  },
  {
    id: 'ref_004',
    orderNumber: 'ORD-55419',
    orderId: 'ord_104',
    createdAt: '2026-11-03T19:05:00Z',
    updatedAt: '2026-11-03T19:06:00Z',
    customerName: 'David K. Miller',
    customerEmail: 'david.miller@apexcorp.com',
    customerTier: 'standard',
    fraudRiskScore: 8,
    items: [
      {
        orderItemId: 'item_104_1',
        name: 'Titanium Thermal Travel Tumbler (24oz)',
        price: 42.00,
        quantity: 1,
        reason: 'damaged_arrival',
        conditionNotes: 'Lid latch arrived cracked during freight transport.',
        photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
      }
    ],
    requestedPayoutMethod: 'original_payment',
    returnMethod: 'keep_item',
    status: 'settled',
    requestedSubtotal: 42.00,
    taxRefund: 3.36,
    shippingRefund: 6.00,
    restockingFee: 0.00,
    storeCreditBonus: 0.00,
    netRefundAmount: 51.36,
    decisionBy: 'Automated Policy Engine',
    decisionDate: '2026-11-03T19:06:00Z',
    gatewayTransactionId: 'ch_ref_7781029',
    resolutionNotes: 'Low item value damaged in transit. Return freight exceeds threshold; customer authorized to keep/recycle item.',
  }
];

export const INITIAL_POLICY_RULES: AutoPolicyRule[] = [
  {
    id: 'rule_1',
    name: 'Instant Micro-Refund Auto Approval',
    description: 'Automatically approve refunds for items under $50 with customer fraud risk score < 25 without human friction.',
    enabled: true,
    type: 'auto_approve',
    conditions: {
      maxAmount: 50.00,
      maxFraudScore: 25,
    }
  },
  {
    id: 'rule_2',
    name: 'Keep-The-Item Eco Exemption',
    description: 'If return shipping cost is estimated at >40% of item value and reason is damaged or defective, waive return shipment.',
    enabled: true,
    type: 'keep_item',
    conditions: {
      maxAmount: 45.00,
      freightRatioThreshold: 0.40,
    }
  },
  {
    id: 'rule_3',
    name: 'Store Credit +10% Growth Incentive',
    description: 'Grant a 10% bonus credit on all store credit refunds to retain customer revenue and reduce cash drain.',
    enabled: true,
    type: 'store_credit_bonus',
    conditions: {
      bonusPercent: 10,
    }
  },
  {
    id: 'rule_4',
    name: 'Fraud Anomaly Escalation Shield',
    description: 'Flag any refund request with risk score above 40 or exceeding $300 for mandatory senior finance inspection.',
    enabled: true,
    type: 'fraud_threshold',
    conditions: {
      maxFraudScore: 40,
      maxAmount: 300,
    }
  },
  {
    id: 'rule_5',
    name: '30-Day Guaranteed Return Window',
    description: 'Accept standard returns within 30 days of shipment delivery date. Automatically block expired return attempts.',
    enabled: true,
    type: 'return_window',
    conditions: {
      daysSincePurchase: 30,
    }
  }
];

export const INITIAL_GATEWAY_EVENTS: GatewayEvent[] = [
  {
    id: 'evt_991',
    type: 'charge.refunded',
    timestamp: '2026-11-03T19:06:02Z',
    amount: 51.36,
    currency: 'USD',
    status: 'succeeded',
    refundId: 'ref_004',
    orderNumber: 'ORD-55419',
    details: 'Refund credited back to Visa ending in 9031 via Stripe Connect gateway.',
  },
  {
    id: 'evt_992',
    type: 'credit.issued',
    timestamp: '2026-11-01T10:15:31Z',
    amount: 293.82,
    currency: 'USD',
    status: 'succeeded',
    refundId: 'ref_001',
    orderNumber: 'ORD-84920',
    details: 'Store credit issued to customer wallet with +10% bonus incentive ($24.90).',
  },
  {
    id: 'evt_993',
    type: 'refund.created',
    timestamp: '2026-11-02T17:10:00Z',
    amount: 199.80,
    currency: 'USD',
    status: 'processing',
    refundId: 'ref_002',
    orderNumber: 'ORD-91042',
    details: 'Pending physical return check-in at Oakland logistics facility.',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_1',
    timestamp: '2026-11-03T19:06:02Z',
    actor: 'Rule Engine #2',
    action: 'AUTO_SETTLE_KEEP_ITEM',
    refundId: 'ref_004',
    orderNumber: 'ORD-55419',
    details: 'Auto-settled $51.36 refund. Waived return shipment under Eco-Exemption policy rule.',
    badge: 'Automation',
  },
  {
    id: 'aud_2',
    timestamp: '2026-11-02T17:10:00Z',
    actor: 'Finance Agent (Sarah M.)',
    action: 'APPROVE_RETURN_LABEL',
    refundId: 'ref_002',
    orderNumber: 'ORD-91042',
    details: 'Authorized prepaid FedEx return label. RMA #RMA-91042-8812 issued.',
    badge: 'Manual Approval',
  },
  {
    id: 'aud_3',
    timestamp: '2026-11-01T10:15:30Z',
    actor: 'Rule Engine #1 & #3',
    action: 'AUTO_APPROVE_STORE_CREDIT',
    refundId: 'ref_001',
    orderNumber: 'ORD-84920',
    details: 'Auto-approved $293.82 store credit including $24.90 incentive. QR code generated.',
    badge: 'Automation',
  }
];
