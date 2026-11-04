import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { 
  Order, 
  RefundRequest, 
  AutoPolicyRule, 
  GatewayEvent, 
  AuditLogEntry 
} from '../types/refund';
import { 
  INITIAL_ORDERS, 
  INITIAL_REFUNDS, 
  INITIAL_POLICY_RULES, 
  INITIAL_GATEWAY_EVENTS, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';

// Seed initial database state if collections are empty
export async function seedInitialDatabaseIfEmpty(currentUserId?: string) {
  try {
    // 1. Seed orders if empty
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      const batch = writeBatch(db);
      for (const order of INITIAL_ORDERS) {
        batch.set(doc(db, 'orders', order.id), order);
      }
      await batch.commit();
    }

    // 2. Seed policy rules if empty
    const rulesSnap = await getDocs(collection(db, 'policy_rules'));
    if (rulesSnap.empty) {
      const batch = writeBatch(db);
      for (const rule of INITIAL_POLICY_RULES) {
        batch.set(doc(db, 'policy_rules', rule.id), rule);
      }
      await batch.commit();
    }

    // 3. Seed refund requests if empty and user is authenticated
    if (currentUserId) {
      const refundsSnap = await getDocs(collection(db, 'refund_requests'));
      if (refundsSnap.empty) {
        const batch = writeBatch(db);
        for (const refund of INITIAL_REFUNDS) {
          batch.set(doc(db, 'refund_requests', refund.id), {
            ...refund,
            userId: currentUserId,
          });
        }
        await batch.commit();
      }

      // 4. Seed gateway events if empty
      const eventsSnap = await getDocs(collection(db, 'gateway_events'));
      if (eventsSnap.empty) {
        const batch = writeBatch(db);
        for (const evt of INITIAL_GATEWAY_EVENTS) {
          batch.set(doc(db, 'gateway_events', evt.id), evt);
        }
        await batch.commit();
      }

      // 5. Seed audit logs if empty
      const logsSnap = await getDocs(collection(db, 'audit_logs'));
      if (logsSnap.empty) {
        const batch = writeBatch(db);
        for (const log of INITIAL_AUDIT_LOGS) {
          batch.set(doc(db, 'audit_logs', log.id), log);
        }
        await batch.commit();
      }
    }
  } catch (error) {
    console.warn("Database seeding notice (may already be populated or permission restricted):", error);
  }
}

// Subscribe to Orders
export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(INITIAL_ORDERS);
      } else {
        const list: Order[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Order));
        onUpdate(list);
      }
    },
    (error) => {
      console.warn("Orders subscription error, using cached initial orders:", error);
      onUpdate(INITIAL_ORDERS);
    }
  );
}

// Subscribe to Refunds (with role check: finance gets all, customer gets own)
export function subscribeRefunds(
  userId: string | undefined, 
  isFinance: boolean,
  onUpdate: (refunds: RefundRequest[]) => void
) {
  const path = 'refund_requests';
  if (!userId) {
    onUpdate(INITIAL_REFUNDS);
    return () => {};
  }

  const colRef = collection(db, path);
  const q = isFinance 
    ? query(colRef) 
    : query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RefundRequest[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as RefundRequest);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list.length > 0 ? list : INITIAL_REFUNDS);
    },
    (error) => {
      console.error("Refunds subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create a new Refund Claim
export async function createRefundInDb(refund: RefundRequest, userId: string): Promise<void> {
  const path = 'refund_requests';
  try {
    const payload = {
      ...refund,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, path, refund.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${refund.id}`);
  }
}

// Update a Refund Status / Financial Overrides
export async function updateRefundInDb(refundId: string, updates: Partial<RefundRequest>): Promise<void> {
  const path = 'refund_requests';
  try {
    const docRef = doc(db, path, refundId);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${refundId}`);
  }
}

// Subscribe to Policy Rules
export function subscribePolicyRules(onUpdate: (rules: AutoPolicyRule[]) => void) {
  const path = 'policy_rules';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: AutoPolicyRule[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as AutoPolicyRule));
      onUpdate(list.length > 0 ? list : INITIAL_POLICY_RULES);
    },
    (error) => {
      console.warn("Policy rules subscription error:", error);
      onUpdate(INITIAL_POLICY_RULES);
    }
  );
}

// Save Policy Rules
export async function savePolicyRulesInDb(rules: AutoPolicyRule[]): Promise<void> {
  const path = 'policy_rules';
  try {
    const batch = writeBatch(db);
    for (const rule of rules) {
      batch.set(doc(db, path, rule.id), rule);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to Gateway Webhook Events
export function subscribeGatewayEvents(onUpdate: (events: GatewayEvent[]) => void) {
  const path = 'gateway_events';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: GatewayEvent[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as GatewayEvent));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list.length > 0 ? list : INITIAL_GATEWAY_EVENTS);
    },
    (error) => {
      console.warn("Gateway events subscription notice:", error);
      onUpdate(INITIAL_GATEWAY_EVENTS);
    }
  );
}

// Add a Gateway Webhook Event
export async function addGatewayEventInDb(event: GatewayEvent): Promise<void> {
  const path = 'gateway_events';
  try {
    await setDoc(doc(db, path, event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${event.id}`);
  }
}

// Subscribe to Audit Logs
export function subscribeAuditLogs(onUpdate: (logs: AuditLogEntry[]) => void) {
  const path = 'audit_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: AuditLogEntry[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as AuditLogEntry));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list.length > 0 ? list : INITIAL_AUDIT_LOGS);
    },
    (error) => {
      console.warn("Audit logs subscription notice:", error);
      onUpdate(INITIAL_AUDIT_LOGS);
    }
  );
}

// Add an Audit Log Entry
export async function addAuditLogInDb(entry: AuditLogEntry): Promise<void> {
  const path = 'audit_logs';
  try {
    await setDoc(doc(db, path, entry.id), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${entry.id}`);
  }
}
