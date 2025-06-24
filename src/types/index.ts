export interface User {
  id: string;
  username: string;
  roles: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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
