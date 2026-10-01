"use client";

import Link from "next/link";
import { useActionState } from "react";
import { placeOrder } from "@/app/(boutique)/commande/actions";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

type Props = { shippingCents: number; freeShippingFromCents: number; onlinePayment: boolean };

export function CartView({ shippingCents, freeShippingFromCents, onlinePayment }: Props) {
  const { lines, subtotalCents, setQty } = useCart();
  const [state, action, pending] = useActionState(placeOrder, null);

  if (!lines.length) {
    return (
      <div>
        <p className="muted">Votre panier est vide.</p>
        <Link href="/boutique" className="button primary">Continuer mes achats</Link>
      </div>
    );
  }

  const freeShipping = freeShippingFromCents > 0 && subtotalCents >= freeShippingFromCents;
  const shipping = freeShipping ? 0 : shippingCents;
  const cart = JSON.stringify(lines.map((l) => ({ productId: l.productId, option: l.option, qty: l.qty })));

  return (
    <div className="cart-layout">
      <div>
        <ul className="cart-lines">
          {lines.map((l) => (
            <li key={l.productId + l.option}>
              {l.image ? <img src={l.image} alt="" /> : <span />}
              <div>
                <Link href={`/produits/${l.slug}`}>{l.name}</Link>
                {l.option ? <p className="muted small">{l.option}</p> : null}
                <p className="small">{formatPrice(l.priceCents)}</p>
              </div>
              <div className="qty">
                <button type="button" onClick={() => setQty(l.productId, l.option, l.qty - 1)} aria-label="Moins">−</button>
                <span>{l.qty}</span>
                <button type="button" onClick={() => setQty(l.productId, l.option, l.qty + 1)} aria-label="Plus">+</button>
              </div>
              <strong>{formatPrice(l.priceCents * l.qty)}</strong>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <dt>Sous-total</dt>
          <dd>{formatPrice(subtotalCents)}</dd>
          <dt>Livraison</dt>
          <dd>{shipping ? formatPrice(shipping) : "Offerte"}</dd>
          <dt className="total">Total</dt>
          <dd className="total">{formatPrice(subtotalCents + shipping)}</dd>
        </dl>
        {!freeShipping && freeShippingFromCents > 0 ? (
          <p className="muted small">
            Plus que {formatPrice(freeShippingFromCents - subtotalCents)} pour la livraison offerte.
          </p>
        ) : null}
      </div>

      <form action={action} className="checkout-form card">
        <h2>Livraison</h2>
        <input type="hidden" name="cart" value={cart} />
        <label>Nom complet<input name="name" required autoComplete="name" /></label>
        <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
        <label>Téléphone<input name="phone" type="tel" autoComplete="tel" /></label>
        <label>Adresse<input name="address" required autoComplete="street-address" /></label>
        <div className="row">
          <label>Code postal<input name="zip" required autoComplete="postal-code" /></label>
          <label>Ville<input name="city" required autoComplete="address-level2" /></label>
        </div>
        <label>Pays<input name="country" defaultValue="France" autoComplete="country-name" /></label>
        <label>Note (facultatif)<textarea name="note" rows={2} /></label>
        {state?.error ? <p className="error">{state.error}</p> : null}
        <button className="button primary" disabled={pending}>
          {pending ? "Un instant…" : onlinePayment ? "Payer par carte" : "Valider la commande"}
        </button>
        {!onlinePayment ? (
          <p className="muted small">Nous vous contactons pour le règlement après validation.</p>
        ) : null}
      </form>
    </div>
  );
}
