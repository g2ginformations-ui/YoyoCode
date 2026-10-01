export type LinkItem = { label: string; href: string };
export type Category = { slug: string; name: string; description: string };
export type Benefit = { title: string; text: string };
export type Testimonial = { name: string; text: string; rating: number };

export type Settings = {
  brandName: string;
  tagline: string;
  announcement: string;
  logoUrl: string;
  colors: { background: string; text: string; primary: string; accent: string; muted: string };
  hero: { title: string; subtitle: string; ctaLabel: string; ctaHref: string; image: string };
  menu: LinkItem[];
  footerLinks: LinkItem[];
  categories: Category[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  contactEmail: string;
  instagram: string;
  tiktok: string;
  footerText: string;
  shippingCents: number;
  freeShippingFromCents: number;
  beforeAfter: { title: string; text: string; images: string[] };
  newsletter: { enabled: boolean; title: string; text: string; code: string; percent: number };
};

export type Subscriber = { email: string; createdAt: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  priceCents: number;
  compareAtCents: number | null;
  category: string;
  images: string[];
  description: string;
  howToUse: string;
  ingredients: string;
  optionName: string;
  optionValues: string[];
  badge: string;
  stock: number;
  featured: boolean;
  published: boolean;
  position: number;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
};

export type OrderStatus = "en attente" | "payée" | "expédiée" | "annulée";

export type OrderItem = { productId: string; name: string; option: string; priceCents: number; qty: number };

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  customer: { name: string; email: string; phone: string; address: string; zip: string; city: string; country: string; note: string };
  subtotalCents: number;
  discountCents: number;
  promoCode: string;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  stripeSessionId: string | null;
};

export type Store = { settings: Settings; products: Product[]; pages: Page[]; orders: Order[]; subscribers: Subscriber[] };
