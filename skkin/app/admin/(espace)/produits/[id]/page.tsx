import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct, duplicateProduct, saveProduct } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { centsToInput } from "@/lib/format";
import { readStore } from "@/lib/store";
import type { Product } from "@/lib/types";

const blank: Product = {
  id: "",
  slug: "",
  name: "",
  subtitle: "",
  priceCents: 0,
  compareAtCents: null,
  category: "",
  images: [],
  description: "",
  howToUse: "",
  ingredients: "",
  optionName: "",
  optionValues: [],
  badge: "",
  stock: 0,
  featured: false,
  published: true,
  position: 0,
};

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function ProductEditor({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok } = await searchParams;
  const { products, settings } = await readStore();
  const product = id === "nouveau" ? { ...blank, position: products.length + 1 } : products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <>
      <p><Link href="/admin/produits">← Produits</Link></p>
      <div className="section-head">
        <h1>{product.id ? product.name : "Nouveau produit"}</h1>
        {product.id ? <a href={`/produits/${product.slug}`} target="_blank" rel="noreferrer">Voir sur le site ↗</a> : null}
      </div>
      {ok ? <p className="success">Modifications enregistrées.</p> : null}

      <form action={saveProduct} className="editor">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid-2">
          <label>Nom<input name="name" defaultValue={product.name} required /></label>
          <label>Adresse de la page (slug)<input name="slug" defaultValue={product.slug} placeholder="généré à partir du nom" /></label>
        </div>
        <label>Sous-titre<input name="subtitle" defaultValue={product.subtitle} /></label>
        <div className="grid-4">
          <label>Prix (€)<input name="price" defaultValue={centsToInput(product.priceCents)} inputMode="decimal" required /></label>
          <label>Prix barré (€)<input name="compareAt" defaultValue={centsToInput(product.compareAtCents)} inputMode="decimal" /></label>
          <label>Stock<input name="stock" type="number" min={0} defaultValue={product.stock} /></label>
          <label>Ordre d'affichage<input name="position" type="number" defaultValue={product.position} /></label>
        </div>
        <label>
          Étiquette sur la photo (ex. Best seller, Nouveau, Soldes ; vide = aucune)
          <input name="badge" defaultValue={product.badge} />
        </label>
        <label>
          Catégorie
          <select name="category" defaultValue={product.category}>
            <option value="">— Aucune —</option>
            {settings.categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Photos</legend>
          {product.images.length ? (
            <div className="thumbs">{product.images.map((src, i) => <img key={src + i} src={src} alt="" />)}</div>
          ) : null}
          <label>
            Adresses des photos (une par ligne, la première est la photo principale)
            <textarea name="images" rows={3} defaultValue={product.images.join("\n")} />
          </label>
          <label>Ajouter des photos depuis l'ordinateur<input name="upload" type="file" accept="image/*" multiple /></label>
        </fieldset>

        <fieldset>
          <legend>Option (teinte, taille…)</legend>
          <div className="grid-2">
            <label>Nom de l'option<input name="optionName" defaultValue={product.optionName} placeholder="Teinte" /></label>
            <label>Valeurs, séparées par des virgules<input name="optionValues" defaultValue={product.optionValues.join(", ")} placeholder="Medium, Dark" /></label>
          </div>
        </fieldset>

        <p className="muted small">Mise en forme des textes : ## Titre, - liste, 1. liste numérotée, **gras**, *italique*, [lien](https://…)</p>
        <label>Description<textarea name="description" rows={7} defaultValue={product.description} /></label>
        <label>Utilisation<textarea name="howToUse" rows={5} defaultValue={product.howToUse} /></label>
        <label>Composition<textarea name="ingredients" rows={3} defaultValue={product.ingredients} /></label>

        <div className="checks">
          <label className="check"><input type="checkbox" name="published" defaultChecked={product.published} /> En ligne</label>
          <label className="check"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Mis en avant sur l'accueil</label>
        </div>
        <button className="button primary">Enregistrer</button>
      </form>

      {product.id ? (
        <div className="actions danger-zone">
          <form action={duplicateProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button className="button">Dupliquer</button>
          </form>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton message={`Supprimer « ${product.name} » ?`}>Supprimer</ConfirmButton>
          </form>
        </div>
      ) : null}
    </>
  );
}
