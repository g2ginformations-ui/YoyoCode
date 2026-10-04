import Link from "next/link";

// Logo « mymotiv. » (image), cliquable : ramène toujours à la page d'accueil.
export default function LogoLink({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`logo-link ${className}`.trim()} aria-label="MyMotiv — page d'accueil">
      <img src="/logo-mymotiv.png" width={960} height={221} alt="MyMotiv" decoding="async" />
    </Link>
  );
}
