import Link from "next/link";
import { CartButton } from "@/components/CartButton";
import { CartProvider } from "@/components/CartProvider";
import { readStore } from "@/lib/store";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await readStore();
  return (
    <CartProvider>
      {settings.announcement ? <div className="announcement">{settings.announcement}</div> : null}
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.brandName} /> : <span className="wordmark">{settings.brandName}</span>}
          </Link>
          <nav className="main-nav" aria-label="Menu principal">
            {settings.menu.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <CartButton />
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <p className="logo"><span className="wordmark">{settings.brandName}</span></p>
            <p className="muted">{settings.tagline}</p>
            {settings.contactEmail ? (
              <p>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </p>
            ) : null}
          </div>
          <nav className="footer-links" aria-label="Informations">
            {settings.footerLinks.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="footer-social">
            {settings.instagram ? <a href={settings.instagram}>Instagram</a> : null}
            {settings.tiktok ? <a href={settings.tiktok}>TikTok</a> : null}
          </div>
        </div>
        <p className="container muted small footer-bottom">
          © {new Date().getFullYear()} {settings.footerText}
        </p>
      </footer>
    </CartProvider>
  );
}
