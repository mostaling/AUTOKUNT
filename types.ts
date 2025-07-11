
export type Language = 'en' | 'fr' | 'ar';

export type PartCondition = 'grade_a' | 'grade_b' | 'for_parts';

export interface Part {
  partSKU: string;
  partName: string;
  description?: string;
  sourceVehicleMake: string;
  sourceVehicleModel: string;
  sourceVehicleYear: number;
  condition: PartCondition;
  warehouseLocation: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityInStock: number;
  photos: string[];
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  vatNumber?: string;
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
}

export interface InvoiceItem {
  partSKU: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  monthlyData: { month: number; year: number; revenue: number; expenses: number }[];
  bestSellingParts: { partSKU: string; partName: string; totalSold: number }[];
}


export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatId: string;
}

export interface AppSettings {
    companyInfo: CompanyInfo;
    vatRate: number; // e.g., 0.19 for 19%
    currencySymbol: string; // e.g., 'TND'
    currencyCode: string; // e.g., 'TND'
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}