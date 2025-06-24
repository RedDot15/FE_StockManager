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
  id: string;
  invoiceNumber: string;
  vendor: Vendor;
  amount: number;
  invoiceDate: string;
  // Add other fields as they appear in your API response
}

export interface RevenueStat {
  name: string; // Vendor, Product, or Category name
  revenue: number;
}
