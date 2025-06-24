export interface User {
  id: string;
  username: string;
  roles: string;
}

export interface Product {
  entityId: string;
  name: string;
  vendorId: string;
  categoryName: string;
  importPrice: number;
  salePrice: number;
  vat: number;
  amount: number;
  earliestExpiry: string;
}

export interface Vendor {
  entityId: string;
  name: string;
}

export interface Invoice {
  entityId: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  tax: number;
}

export interface RevenueStat {
  name: string; // Vendor, Product, or Category name
  revenue: number;
}
