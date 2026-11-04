/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './components/MerchantDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { RulesEngine } from './components/RulesEngine';
import { GatewaySimulator } from './components/GatewaySimulator';
import { AuditTrail } from './components/AuditTrail';
import { RefundDetailModal } from './components/RefundDetailModal';
import { GitHubShipModal } from './components/GitHubShipModal';
import { 
  INITIAL_ORDERS, 
  INITIAL_REFUNDS, 
  INITIAL_POLICY_RULES, 
  INITIAL_GATEWAY_EVENTS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { 
  RefundRequest, 
  RefundStatus, 
  PayoutMethod, 
  AutoPolicyRule, 
  GatewayEvent, 
  AuditLogEntry,
  Order 
} from './types/refund';
import { 
  seedInitialDatabaseIfEmpty, 
  subscribeOrders, 
  subscribeRefunds, 
  createRefundInDb, 
  updateRefundInDb, 
  subscribePolicyRules, 
  savePolicyRulesInDb, 
  subscribeGatewayEvents, 
  addGatewayEventInDb, 
  subscribeAuditLogs, 
  addAuditLogInDb 
} from './firebase/dbService';
import confetti from 'canvas-confetti';
import { Database, ShieldCheck } from 'lucide-react';

function RefundFlowApp() {
  const { user, isFinance, signInWithGoogle } = useAuth();
  const [currentView, setCurrentView] = useState<'merchant' | 'customer' | 'rules' | 'gateway' | 'audit'>('merchant');
  
  // Real-time Database state
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [refunds, setRefunds] = useState<RefundRequest[]>(INITIAL_REFUNDS);
  const [policyRules, setPolicyRules] = useState<AutoPolicyRule[]>(INITIAL_POLICY_RULES);
  const [gatewayEvents, setGatewayEvents] = useState<GatewayEvent[]>(INITIAL_GATEWAY_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);

  const pendingCount = refunds.filter(r => r.status === 'needs_review').length;

  // 1. Seed initial database collections on first user sign in
  useEffect(() => {
    seedInitialDatabaseIfEmpty(user?.uid);
  }, [user?.uid]);

  // 2. Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubOrders = subscribeOrders(setOrders);
    const unsubRules = subscribePolicyRules(setPolicyRules);
    const unsubEvents = subscribeGatewayEvents(setGatewayEvents);
    const unsubAudit = subscribeAuditLogs(setAuditLogs);

    return () => {
      unsubOrders();
      unsubRules();
      unsubEvents();
      unsubAudit();
    };
  }, []);

  // 3. Subscribe to refunds when user or role changes
  useEffect(() => {
    const unsubRefunds = subscribeRefunds(user?.uid, isFinance, setRefunds);
    return () => {
      unsubRefunds();
    };
  }, [user?.uid, isFinance]);

  // Handle new refund request submitted via customer portal
  const handleSubmitRefund = async (newRefund: RefundRequest) => {
    const effectiveUserId = user?.uid || 'guest_user';
    const refundWithUser = { ...newRefund, userId: effectiveUserId };

    // Optimistic local update
    setRefunds(prev => [refundWithUser, ...prev]);

    // Persist to Firestore
    if (user?.uid) {
      await createRefundInDb(refundWithUser, user.uid);
    }

    // Add audit log
    const newAuditLog: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: newRefund.status === 'auto_approved' ? 'Automated Policy Engine' : (user?.displayName || 'Customer'),
      action: newRefund.status === 'auto_approved' ? 'AUTO_APPROVE_REFUND' : 'INTAKE_SUBMITTED',
      refundId: newRefund.id,
      orderNumber: newRefund.orderNumber,
      details: `${newRefund.customerName} filed claim for ${newRefund.items.length} item(s) ($${newRefund.netRefundAmount.toFixed(2)}). Status: ${newRefund.status}`,
      badge: newRefund.status === 'auto_approved' ? 'Automation' : 'Customer',
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
    if (user?.uid) {
      addAuditLogInDb(newAuditLog);
    }

    // If auto approved, trigger payment gateway webhook
    if (newRefund.status === 'auto_approved') {
      const isStoreCredit = newRefund.requestedPayoutMethod === 'store_credit_bonus';
      const newGatewayEvent: GatewayEvent = {
        id: `evt_${Date.now()}`,
        type: isStoreCredit ? 'credit.issued' : 'charge.refunded',
        timestamp: new Date().toISOString(),
        amount: newRefund.netRefundAmount,
        currency: 'USD',
        status: 'succeeded',
        refundId: newRefund.id,
        orderNumber: newRefund.orderNumber,
        details: isStoreCredit 
          ? `Store credit with +10% bonus credited to ${newRefund.customerEmail}` 
          : `Refund processed to original payment method via Stripe Connect`,
      };
      setGatewayEvents(prev => [newGatewayEvent, ...prev]);
      if (user?.uid) {
        addGatewayEventInDb(newGatewayEvent);
      }
    }
  };

  // Handle finance manager resolution from detail modal
  const handleUpdateStatus = async (
    refundId: string, 
    newStatus: RefundStatus, 
    decisionNotes: string, 
    financialOverrides?: {
      restockingFee: number;
      shippingRefund: number;
      netRefundAmount: number;
      payoutMethod: PayoutMethod;
    }
  ) => {
    const updates = {
      status: newStatus,
      resolutionNotes: decisionNotes,
      decisionBy: (isFinance ? 'Finance Ops Team' : 'Automated Policy Engine') as any,
      decisionDate: new Date().toISOString(),
      ...(financialOverrides ? {
        restockingFee: financialOverrides.restockingFee,
        shippingRefund: financialOverrides.shippingRefund,
        netRefundAmount: financialOverrides.netRefundAmount,
        requestedPayoutMethod: financialOverrides.payoutMethod,
      } : {})
    };

    // Optimistic local update
    setRefunds(prev => prev.map(r => r.id === refundId ? { ...r, ...updates } : r));

    // Persist to Firestore
    if (user?.uid) {
      await updateRefundInDb(refundId, updates);
    }

    const targetRefund = refunds.find(r => r.id === refundId);
    if (!targetRefund) return;

    // Add audit log
    const newAuditLog: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user?.displayName ? `${user.displayName} (Finance)` : 'Finance Agent (Ops Desk)',
      action: `MANUAL_${newStatus.toUpperCase()}`,
      refundId: targetRefund.id,
      orderNumber: targetRefund.orderNumber,
      details: decisionNotes || `Status updated to ${newStatus}`,
      badge: 'Manual Review',
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
    if (user?.uid) {
      addAuditLogInDb(newAuditLog);
    }

    // Trigger gateway event on settlement
    if (newStatus === 'settled') {
      const payoutMethod = financialOverrides?.payoutMethod || targetRefund.requestedPayoutMethod;
      const isStoreCredit = payoutMethod === 'store_credit_bonus';
      const netAmount = financialOverrides?.netRefundAmount ?? targetRefund.netRefundAmount;

      const newGatewayEvent: GatewayEvent = {
        id: `evt_${Date.now()}`,
        type: isStoreCredit ? 'credit.issued' : 'charge.refunded',
        timestamp: new Date().toISOString(),
        amount: netAmount,
        currency: 'USD',
        status: 'succeeded',
        refundId: targetRefund.id,
        orderNumber: targetRefund.orderNumber,
        details: `Settlement authorized by Finance Team: $${netAmount.toFixed(2)} disbursed.`,
      };
      setGatewayEvents(prev => [newGatewayEvent, ...prev]);
      if (user?.uid) {
        addGatewayEventInDb(newGatewayEvent);
      }
    }
  };

  // Quick 1-click approve from table
  const handleQuickApprove = (refundId: string) => {
    handleUpdateStatus(refundId, 'settled', 'Quick-approved in full from operations dashboard.');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Save policy rules in Firestore
  const handleUpdatePolicyRules = async (updatedRules: AutoPolicyRule[]) => {
    setPolicyRules(updatedRules);
    if (user?.uid) {
      await savePolicyRulesInDb(updatedRules);
    }
  };

  // Simulate synthetic gateway event
  const handleTriggerSimulatedWebhook = async (eventType: GatewayEvent['type']) => {
    const mockRef = refunds[0] || { id: 'ref_demo', orderNumber: 'ORD-DEMO', netRefundAmount: 49.99 };
    const newEvent: GatewayEvent = {
      id: `evt_${Date.now()}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      amount: mockRef.netRefundAmount,
      currency: 'USD',
      status: 'succeeded',
      refundId: mockRef.id,
      orderNumber: mockRef.orderNumber,
      details: eventType === 'charge.refunded' 
        ? 'Synthetic charge refund completed by gateway webhook callback'
        : 'Bank chargeback dispute opened by cardholder bank (Reason: Product Unacceptable)',
    };
    setGatewayEvents(prev => [newEvent, ...prev]);

    const newAuditLog: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Payment Gateway (Webhook)',
      action: eventType.toUpperCase().replace('.', '_'),
      refundId: mockRef.id,
      orderNumber: mockRef.orderNumber,
      details: `Received verified webhook notification from payment network.`,
      badge: 'Webhook',
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);

    if (user?.uid) {
      await addGatewayEventInDb(newEvent);
      await addAuditLogInDb(newAuditLog);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navigation with Auth */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        pendingCount={pendingCount}
        onOpenShipModal={() => setIsShipModalOpen(true)}
        onNewRequest={() => setCurrentView('customer')}
      />

      {/* Guest Prompt Banner if not authenticated */}
      {!user && (
        <div className="bg-indigo-900 text-white px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Cloud Persistence & Auth Enabled:</strong> Sign in with Google to sync refunds, policy rules, and audit trails to your Firestore database.
            </span>
          </div>
          <button
            onClick={() => signInWithGoogle()}
            className="px-3 py-1 bg-white text-indigo-950 font-semibold rounded hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-2xs"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Main Body Content */}
      <main className="flex-1 pb-16">
        {currentView === 'merchant' && (
          <MerchantDashboard
            refunds={refunds}
            onSelectRefund={(refund) => setSelectedRefund(refund)}
            onQuickApprove={handleQuickApprove}
          />
        )}

        {currentView === 'customer' && (
          <CustomerPortal
            orders={orders}
            onSubmitRefund={handleSubmitRefund}
            onViewInMerchantHub={(refundId) => {
              setCurrentView('merchant');
              const found = refunds.find(r => r.id === refundId);
              if (found) setSelectedRefund(found);
            }}
          />
        )}

        {currentView === 'rules' && (
          <RulesEngine
            rules={policyRules}
            onUpdateRules={handleUpdatePolicyRules}
          />
        )}

        {currentView === 'gateway' && (
          <GatewaySimulator
            events={gatewayEvents}
            onTriggerSimulatedWebhook={handleTriggerSimulatedWebhook}
          />
        )}

        {currentView === 'audit' && (
          <AuditTrail logs={auditLogs} />
        )}
      </main>

      {/* Refund Decision Drawer Modal */}
      <RefundDetailModal
        refund={selectedRefund}
        isOpen={Boolean(selectedRefund)}
        onClose={() => setSelectedRefund(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* GitHub Ship Modal */}
      <GitHubShipModal
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">RefundFlow</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Firebase Auth & Firestore Active</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsShipModalOpen(true)}
              className="hover:text-slate-900 font-medium text-indigo-600 underline"
            >
              Ready to ship to GitHub
            </button>
            <span>·</span>
            <span>PCI DSS & SOC-2 Compliant Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RefundFlowApp />
    </AuthProvider>
  );
}
