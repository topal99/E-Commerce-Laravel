export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  availability: string;
  images: {
    src: string;
    alt: string;
    "data-ai-hint"?: string;
  }[];
  colors: ProductVariant[];
  sizes: ProductVariant[];
};

export type BreadcrumbItem = {
  name: string;
  href: string;
};
