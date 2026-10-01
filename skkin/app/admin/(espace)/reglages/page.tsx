import { saveSettings } from "@/app/admin/actions";
import { centsToInput } from "@/lib/format";
import { readStore } from "@/lib/store";
import type { LinkItem } from "@/lib/types";

const linkLines = (items: LinkItem[]) => items.map((l) => `${l.label} | ${l.href}`).join("\n");

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { settings: s } = await readStore();
  return (
    <>
      <h1>Réglages du site</h1>
      {ok ? <p className="success">Réglages enregistrés.</p> : null}
      <form action={saveSettings} className="editor">
        <fieldset>
          <legend>Marque</legend>
          <div className="grid-2">
            <label>Nom de la boutique<input name="brandName" defaultValue={s.brandName} required /></label>
            <label>Slogan<input name="tagline" defaultValue={s.tagline} /></label>
          </div>
          <label>Bandeau d'annonce (vide = masqué)<input name="announcement" defaultValue={s.announcement} /></label>
          <div className="grid-2">
            <label>Adresse du logo (vide = nom en texte)<input name="logoUrl" defaultValue={s.logoUrl} /></label>
            <label>Ou envoyer un logo<input name="logoUpload" type="file" accept="image/*" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Couleurs</legend>
          <div className="grid-5">
            <label>Fond<input type="color" name="colorBackground" defaultValue={s.colors.background} /></label>
            <label>Texte<input type="color" name="colorText" defaultValue={s.colors.text} /></label>
            <label>Boutons<input type="color" name="colorPrimary" defaultValue={s.colors.primary} /></label>
            <label>Accent<input type="color" name="colorAccent" defaultValue={s.colors.accent} /></label>
            <label>Fond secondaire<input type="color" name="colorMuted" defaultValue={s.colors.muted} /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Accueil : grande bannière</legend>
          <label>Titre<input name="heroTitle" defaultValue={s.hero.title} /></label>
          <label>Texte<textarea name="heroSubtitle" rows={2} defaultValue={s.hero.subtitle} /></label>
          <div className="grid-2">
            <label>Texte du bouton<input name="heroCtaLabel" defaultValue={s.hero.ctaLabel} /></label>
            <label>Lien du bouton<input name="heroCtaHref" defaultValue={s.hero.ctaHref} /></label>
            <label>Adresse de l'image<input name="heroImage" defaultValue={s.hero.image} /></label>
            <label>Ou envoyer une image<input name="heroUpload" type="file" accept="image/*" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Accueil : blocs</legend>
          <label>
            Points forts (une ligne par point : Titre | Texte)
            <textarea name="benefits" rows={4} defaultValue={s.benefits.map((b) => `${b.title} | ${b.text}`).join("\n")} />
          </label>
          <label>
            Avis clients (une ligne par avis : Nom | Note sur 5 | Texte)
            <textarea name="testimonials" rows={4} defaultValue={s.testimonials.map((t) => `${t.name} | ${t.rating} | ${t.text}`).join("\n")} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Accueil : avant / après</legend>
          <div className="grid-2">
            <label>Titre<input name="beforeAfterTitle" defaultValue={s.beforeAfter.title} /></label>
            <label>Texte<input name="beforeAfterText" defaultValue={s.beforeAfter.text} /></label>
          </div>
          {s.beforeAfter.images.length ? (
            <div className="thumbs">{s.beforeAfter.images.map((src, i) => <img key={src + i} src={src} alt="" />)}</div>
          ) : null}
          <label>
            Photos (une adresse par ligne ; videz la liste pour masquer la section)
            <textarea name="beforeAfterImages" rows={3} defaultValue={s.beforeAfter.images.join("\n")} />
          </label>
          <label>Ajouter des photos<input name="beforeAfterUpload" type="file" accept="image/*" multiple /></label>
        </fieldset>

        <fieldset>
          <legend>Newsletter et code de bienvenue</legend>
          <label className="check"><input type="checkbox" name="newsletterEnabled" defaultChecked={s.newsletter.enabled} /> Afficher l'inscription sur l'accueil</label>
          <div className="grid-2">
            <label>Titre<input name="newsletterTitle" defaultValue={s.newsletter.title} /></label>
            <label>Texte<input name="newsletterText" defaultValue={s.newsletter.text} /></label>
            <label>Code promo donné à l'inscription<input name="newsletterCode" defaultValue={s.newsletter.code} /></label>
            <label>Réduction (%)<input name="newsletterPercent" type="number" min={0} max={100} defaultValue={s.newsletter.percent} /></label>
          </div>
          <p className="muted small">Le code n'est valable que pour la première commande de chaque adresse e-mail.</p>
        </fieldset>

        <fieldset>
          <legend>Navigation</legend>
          <label>
            Menu du haut (une ligne par lien : Libellé | /adresse)
            <textarea name="menu" rows={6} defaultValue={linkLines(s.menu)} />
          </label>
          <label>
            Liens du pied de page (Libellé | /adresse)
            <textarea name="footerLinks" rows={6} defaultValue={linkLines(s.footerLinks)} />
          </label>
          <label>
            Catégories (une ligne par catégorie : identifiant | Nom | Description)
            <textarea name="categories" rows={6} defaultValue={s.categories.map((c) => `${c.slug} | ${c.name} | ${c.description}`).join("\n")} />
          </label>
          <p className="muted small">
            Lien vers une catégorie : /boutique?categorie=identifiant · vers une page : /pages/adresse · vers un produit : /produits/adresse
          </p>
        </fieldset>

        <fieldset>
          <legend>Livraison</legend>
          <div className="grid-2">
            <label>Frais de livraison (€)<input name="shipping" defaultValue={centsToInput(s.shippingCents)} inputMode="decimal" /></label>
            <label>Livraison offerte dès (€, 0 = jamais)<input name="freeShippingFrom" defaultValue={centsToInput(s.freeShippingFromCents)} inputMode="decimal" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contact & réseaux</legend>
          <div className="grid-2">
            <label>E-mail de contact<input name="contactEmail" type="email" defaultValue={s.contactEmail} /></label>
            <label>Texte du bas de page<input name="footerText" defaultValue={s.footerText} /></label>
            <label>Lien Instagram<input name="instagram" defaultValue={s.instagram} placeholder="https://instagram.com/…" /></label>
            <label>Lien TikTok<input name="tiktok" defaultValue={s.tiktok} placeholder="https://tiktok.com/@…" /></label>
          </div>
        </fieldset>

        <button className="button primary">Enregistrer les réglages</button>
      </form>
    </>
  );
}
