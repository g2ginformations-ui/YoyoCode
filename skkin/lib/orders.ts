import { updateStore } from "@/lib/store";
import type { Order, OrderStatus, Store } from "@/lib/types";

// Le stock est retiré à la création de la commande et rendu si elle est annulée.
function adjustStock(store: Store, order: Order, direction: 1 | -1) {
  for (const item of order.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (product) product.stock = Math.max(0, product.stock + direction * item.qty);
  }
}

export function changeStatus(store: Store, order: Order, status: OrderStatus) {
  if (order.status === status) return;
  if (status === "annulée") adjustStock(store, order, 1);
  if (order.status === "annulée") adjustStock(store, order, -1);
  order.status = status;
}

// Paiement confirmé par Stripe (retour sur le site ou webhook, selon ce qui arrive en premier).
export function markOrderPaid(orderId: string, sessionId: string): Promise<Order | null> {
  return updateStore((store) => {
    const order = store.orders.find((o) => o.id === orderId && o.stripeSessionId === sessionId);
    if (!order) return null;
    if (order.status === "en attente" || order.status === "annulée") changeStatus(store, order, "payée");
    return order;
  });
}

// Paiement abandonné : la session Stripe a expiré sans être payée.
export function cancelUnpaidOrder(orderId: string, sessionId: string): Promise<void> {
  return updateStore((store) => {
    const order = store.orders.find((o) => o.id === orderId && o.stripeSessionId === sessionId);
    if (order?.status === "en attente") changeStatus(store, order, "annulée");
  });
}
