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

export interface CategoryRevenueStat {
  name: string;
  totalRevenue: number;
}

export interface VendorRevenueStat {
  id: string;
  name: string;
  totalRevenue: number;
}

export interface ProductRevenueStat {
  id: string;
  name: string;
  vendorName: string;
  categoryName: string;
  amount: number;
  totalRevenue: number;
}
