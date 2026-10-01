import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePage, savePage } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { readStore } from "@/lib/store";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function PageEditor({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok } = await searchParams;
  const { pages } = await readStore();
  const page = id === "nouveau" ? { id: "", slug: "", title: "", content: "", published: true } : pages.find((p) => p.id === id);
  if (!page) notFound();

  return (
    <>
      <p><Link href="/admin/pages">← Pages</Link></p>
      <div className="section-head">
        <h1>{page.id ? page.title : "Nouvelle page"}</h1>
        {page.id ? <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer">Voir sur le site ↗</a> : null}
      </div>
      {ok ? <p className="success">Modifications enregistrées. Adresse de la page : /pages/{page.slug}</p> : null}
      <form action={savePage} className="editor">
        <input type="hidden" name="id" value={page.id} />
        <div className="grid-2">
          <label>Titre<input name="title" defaultValue={page.title} required /></label>
          <label>Adresse (slug)<input name="slug" defaultValue={page.slug} placeholder="généré à partir du titre" /></label>
        </div>
        <p className="muted small">Mise en forme : ## Titre, ### Sous-titre, - liste, 1. liste numérotée, **gras**, *italique*, [lien](https://…)</p>
        <label>Contenu<textarea name="content" rows={20} defaultValue={page.content} /></label>
        <label className="check"><input type="checkbox" name="published" defaultChecked={page.published} /> En ligne</label>
        <button className="button primary">Enregistrer</button>
      </form>
      {page.id ? (
        <form action={deletePage} className="danger-zone">
          <input type="hidden" name="id" value={page.id} />
          <ConfirmButton message={`Supprimer la page « ${page.title} » ?`}>Supprimer la page</ConfirmButton>
        </form>
      ) : null}
    </>
  );
}
