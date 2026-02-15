/**
 * Sponsors YAPÓ: carrusel home con logos y cupones 20%.
 * Imágenes en public/images/sponsors/ (ferrex.png, salud-protegida.png, etc.).
 */

export type SponsorCategory = "mercaderías" | "medicamentos" | "nafta";

export interface SponsorYapo {
  id: string;
  name: string;
  /** Ruta en public: /images/sponsors/xxx.png */
  image: string;
  /** Descuento en porcentaje (ej. 20). */
  discountPercent: number;
  /** Categorías donde aplica el descuento. */
  categories: SponsorCategory[];
  /** Opcional: enlace a cupón o oferta. */
  link?: string;
}

export const SPONSORS_YAPO: SponsorYapo[] = [
  { id: "ferrex", name: "FERREX", image: "/images/sponsors/ferrex.png", discountPercent: 20, categories: ["mercaderías"], link: "#" },
  { id: "salud-protegida", name: "Salud Protegida", image: "/images/sponsors/salud-protegida.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "puntofarma", name: "puntofarma", image: "/images/sponsors/puntofarma.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "tajy", name: "Aseguradora Tajy", image: "/images/sponsors/tajy.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "biggie", name: "Biggie express", image: "/images/sponsors/biggie.png", discountPercent: 20, categories: ["mercaderías"], link: "#" },
  { id: "mapfre", name: "MAPFRE", image: "/images/sponsors/mapfre.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "copetrol", name: "COPETROL", image: "/images/sponsors/copetrol.png", discountPercent: 20, categories: ["nafta"], link: "#" },
  { id: "sanatorio-intermed", name: "Sanatorio / InterMed", image: "/images/sponsors/sanatorio-intermed.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "shell", name: "Shell", image: "/images/sponsors/shell.png", discountPercent: 20, categories: ["nafta"], link: "#" },
  { id: "farmacenter", name: "Farmacenter", image: "/images/sponsors/farmacenter.png", discountPercent: 20, categories: ["medicamentos"], link: "#" },
  { id: "petrobras", name: "PETROBRAS", image: "/images/sponsors/petrobras.png", discountPercent: 20, categories: ["nafta"], link: "#" },
  { id: "superseis", name: "SUPERSEIS", image: "/images/sponsors/superseis.png", discountPercent: 20, categories: ["mercaderías"], link: "#" },
  { id: "stock", name: "STOCK supermercad", image: "/images/sponsors/stock.png", discountPercent: 20, categories: ["mercaderías"], link: "#" },
  { id: "ngo", name: "NGO", image: "/images/sponsors/ngo.png", discountPercent: 20, categories: ["mercaderías", "medicamentos"], link: "#" },
];

const CATEGORY_LABELS: Record<SponsorCategory, string> = {
  mercaderías: "Mercaderías",
  medicamentos: "Medicamentos",
  nafta: "Nafta",
};

export function getCategoryLabel(c: SponsorCategory): string {
  return CATEGORY_LABELS[c];
}
