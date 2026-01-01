export interface CarouselItem {
  _id?: string;
  id?: number;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: Date;
  endDate?: Date;
  clicks?: number;
  impressions?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Feature {
  id: number;
  title: string;
  icon: string;
  description: string;
}

export interface Style {
  name: string;
  description: string;
  image: string;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  images: ProductImage[];
  category: string | Category;
  subcategory?: string | Category;
  tags: string[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  inventory: {
    trackQuantity: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields from backend
  primaryImage?: ProductImage;
  discountPercentage?: number;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  // Legacy fields for backward compatibility
  originalPrice?: number;
  occasions?: string[];
  sizes?: string[];
  stock?: { [key: string]: number };
  pincodeDelivery?: { [key: string]: { deliveryTime: string } };
  details?: string[];
}

export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment?: number;
  sku?: string;
  inventory?: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface CollectionCategory {
  name: string;
  value: string;
}

export interface CollectionOccasion {
  name: string;
  value: string;
  image?: string;
}

export interface TrendingLook {
  id: number;
  gradient: string;
  title: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  rating: number;
  review: string;
  product: string;
}
