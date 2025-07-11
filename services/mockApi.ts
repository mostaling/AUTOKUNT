
import type { Part, Customer, Invoice, InvoiceItem, Expense, DashboardMetrics, AppSettings } from '../types';
import { InvoiceStatus } from '../types';

// --- MOCK DATA INITIALIZATION (CURRENCY: TND, VAT: 19%) ---
const initialParts: Part[] = [
  { partSKU: 'VW-GOLF4-ALT-001', partName: 'Alternateur', description: 'Alternateur Bosch 120A', sourceVehicleMake: 'Volkswagen', sourceVehicleModel: 'Golf IV', sourceVehicleYear: 2002, condition: 'grade_a', warehouseLocation: 'A-3-B', purchasePrice: 80, sellingPrice: 250, quantityInStock: 5, photos: ['https://picsum.photos/id/10/200/200'] },
  { partSKU: 'PEU-208-DR-G-001', partName: 'Portière avant gauche', description: 'Portière avant gauche, couleur rouge', sourceVehicleMake: 'Peugeot', sourceVehicleModel: '208', sourceVehicleYear: 2015, condition: 'grade_b', warehouseLocation: 'C-1-A', purchasePrice: 160, sellingPrice: 480, quantityInStock: 2, photos: ['https://picsum.photos/id/11/200/200'] },
  { partSKU: 'REN-CLIO3-BUMP-F-002', partName: 'Pare-choc avant', description: 'Pare-choc avant avec phares antibrouillard', sourceVehicleMake: 'Renault', sourceVehicleModel: 'Clio 3', sourceVehicleYear: 2008, condition: 'for_parts', warehouseLocation: 'B-2-D', purchasePrice: 130, sellingPrice: 400, quantityInStock: 3, photos: ['https://picsum.photos/id/12/200/200'] },
];

const initialCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Jean Dupont', address: '123 Rue de la Liberté, 2000 Le Bardo, Tunis', phone: '71010101', email: 'jean.dupont@email.com', vatNumber: 'TN123456789' },
  { id: 'CUST-002', name: 'Garage Solide', address: '45 Avenue Habib Bourguiba, 1001 Tunis', phone: '71234567', email: 'contact@garagesolide.tn' },
];

const initialInvoices: Invoice[] = [
  { id: 'INV-001', invoiceNumber: 'FACT-2024-0001', customerId: 'CUST-001', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), status: InvoiceStatus.Paid, items: [{ partSKU: 'VW-GOLF4-ALT-001', description: 'Alternateur Bosch 120A', quantity: 1, unitPrice: 250 }] },
  { id: 'INV-002', invoiceNumber: 'FACT-2024-0002', customerId: 'CUST-002', date: new Date().toISOString(), status: InvoiceStatus.Paid, items: [{ partSKU: 'REN-CLIO3-BUMP-F-002', description: 'Pare-choc avant', quantity: 1, unitPrice: 400 }, { partSKU: 'PEU-208-DR-G-001', description: 'Portière avant gauche', quantity: 1, unitPrice: 480 }] },
];

const initialExpenses: Expense[] = [
    { id: 'EXP-001', date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), description: 'Loyer Atelier', amount: 3500 },
    { id: 'EXP-002', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), description: "Achat épave Clio 3", amount: 1500 },
];

const initialSettings: AppSettings = {
    companyInfo: {
        name: 'AutoPart-Manager Pro',
        address: '10 Rue de la Technologie, El Ghazela, Tunis',
        phone: '+216 70 123 456',
        email: 'contact@autopart-manager.tn',
        vatId: 'TN 00 123456/A/B/000'
    },
    vatRate: 0.19,
    currencySymbol: 'TND',
    currencyCode: 'TND'
};


// --- LOCAL STORAGE HELPERS ---
const getFromStorage = <T,>(key: string, initialValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
    } catch(e) {
        return initialValue;
    }
}

const saveToStorage = <T,>(key: string, data: T) => {
    window.localStorage.setItem(key, JSON.stringify(data));
}

// --- API FUNCTIONS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    // --- Settings ---
    getSettings: async (): Promise<AppSettings> => {
        await delay(50);
        return getFromStorage('settings', initialSettings);
    },
    saveSettings: async (settings: AppSettings): Promise<AppSettings> => {
        await delay(200);
        saveToStorage('settings', settings);
        return settings;
    },

    // --- Parts ---
    getParts: async (): Promise<Part[]> => {
        await delay(200);
        return getFromStorage('parts', initialParts);
    },
    savePart: async (part: Part): Promise<Part> => {
        await delay(300);
        let parts = getFromStorage('parts', initialParts);
        const existingIndex = parts.findIndex(p => p.partSKU === part.partSKU);
        if (existingIndex > -1) {
            parts[existingIndex] = part;
        } else {
            parts.push(part);
        }
        saveToStorage('parts', parts);
        return part;
    },
    deletePart: async (sku: string): Promise<void> => {
        await delay(300);
        let parts = getFromStorage('parts', initialParts);
        parts = parts.filter(p => p.partSKU !== sku);
        saveToStorage('parts', parts);
    },

    // --- Invoices ---
    getInvoices: async (): Promise<Invoice[]> => {
        await delay(200);
        return getFromStorage('invoices', initialInvoices);
    },
    getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
        await delay(100);
        const invoices = getFromStorage('invoices', initialInvoices);
        return invoices.find(i => i.id === id);
    },
    saveInvoice: async (invoice: Invoice): Promise<Invoice> => {
        await delay(400);
        let invoices = getFromStorage('invoices', initialInvoices);
        const existingIndex = invoices.findIndex(i => i.id === invoice.id);

        const isFinalizing = (oldStatus: InvoiceStatus, newStatus: InvoiceStatus) => 
            oldStatus === InvoiceStatus.Draft && newStatus !== InvoiceStatus.Draft;

        if (existingIndex > -1) {
            const oldInvoice = invoices[existingIndex];
            if (isFinalizing(oldInvoice.status, invoice.status)) {
                let parts = getFromStorage('parts', initialParts);
                invoice.items.forEach(item => {
                    const partIndex = parts.findIndex(p => p.partSKU === item.partSKU);
                    if (partIndex > -1) {
                        parts[partIndex].quantityInStock -= item.quantity;
                    }
                });
                saveToStorage('parts', parts);
            }
            invoices[existingIndex] = invoice;
        } else {
            invoices.push(invoice);
            if (invoice.status !== InvoiceStatus.Draft) {
                let parts = getFromStorage('parts', initialParts);
                 invoice.items.forEach(item => {
                    const partIndex = parts.findIndex(p => p.partSKU === item.partSKU);
                    if (partIndex > -1) {
                        parts[partIndex].quantityInStock -= item.quantity;
                    }
                });
                saveToStorage('parts', parts);
            }
        }
        saveToStorage('invoices', invoices);
        return invoice;
    },
    deleteInvoice: async (id: string): Promise<void> => {
        await delay(300);
        let invoices = getFromStorage('invoices', initialInvoices);
        invoices = invoices.filter(i => i.id !== id);
        saveToStorage('invoices', invoices);
    },
    getNextInvoiceNumber: async (): Promise<string> => {
        await delay(50);
        const invoices = getFromStorage('invoices', initialInvoices);
        const currentYear = new Date().getFullYear();
        const yearInvoices = invoices.filter(i => i.invoiceNumber.startsWith(`FACT-${currentYear}`));
        const nextId = yearInvoices.length + 1;
        return `FACT-${currentYear}-${String(nextId).padStart(4, '0')}`;
    },

    // --- Customers ---
    getCustomers: async (): Promise<Customer[]> => {
        await delay(200);
        return getFromStorage('customers', initialCustomers);
    },
    getCustomerById: async (id: string): Promise<Customer | undefined> => {
        await delay(100);
        const customers = getFromStorage('customers', initialCustomers);
        return customers.find(c => c.id === id);
    },
    saveCustomer: async (customer: Customer): Promise<Customer> => {
        await delay(300);
        let customers = getFromStorage('customers', initialCustomers);
        const existingIndex = customers.findIndex(c => c.id === customer.id);
        if (existingIndex > -1) {
            customers[existingIndex] = customer;
        } else {
            customers.unshift(customer);
        }
        saveToStorage('customers', customers);
        return customer;
    },
    deleteCustomer: async (id: string): Promise<void> => {
        await delay(300);
        let customers = getFromStorage('customers', initialCustomers);
        customers = customers.filter(c => c.id !== id);
        saveToStorage('customers', customers);
    },

    // --- Expenses ---
    getExpenses: async (): Promise<Expense[]> => {
        await delay(200);
        return getFromStorage('expenses', initialExpenses);
    },
    addExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
        await delay(300);
        const expenses = getFromStorage('expenses', initialExpenses);
        const newExpense = { ...expense, id: `EXP-${Date.now()}` };
        expenses.unshift(newExpense);
        saveToStorage('expenses', expenses);
        return newExpense;
    },
    deleteExpense: async (id: string): Promise<void> => {
        await delay(300);
        let expenses = getFromStorage('expenses', initialExpenses);
        expenses = expenses.filter(e => e.id !== id);
        saveToStorage('expenses', expenses);
    },

    // --- Dashboard ---
    getDashboardMetrics: async (): Promise<DashboardMetrics> => {
        await delay(500);
        const invoices = getFromStorage('invoices', initialInvoices);
        const expenses = getFromStorage('expenses', initialExpenses);
        const parts = getFromStorage('parts', initialParts);

        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.Paid);
        const totalRevenue = paidInvoices.reduce((sum, inv) => {
            const invoiceTotal = inv.items.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity, 0);
            return sum + invoiceTotal;
        }, 0);

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const profit = totalRevenue - totalExpenses;
        
        const monthlyData: { [key: string]: { revenue: number; expenses: number; month: number, year: number } } = {};

        paidInvoices.forEach(inv => {
            const date = new Date(inv.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            const total = inv.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
            if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0, month, year };
            monthlyData[key].revenue += total;
        });

        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            if (!monthlyData[key]) monthlyData[key] = { revenue: 0, expenses: 0, month, year };
            monthlyData[key].expenses += exp.amount;
        });
        
        const chartData = Object.values(monthlyData)
            .sort((a,b) => a.year === b.year ? a.month - b.month : a.year - b.year)
            .slice(-6); 

        const salesCount: { [key: string]: number } = {};
        invoices.filter(inv => inv.status === InvoiceStatus.Paid || inv.status === InvoiceStatus.Sent).forEach(inv => {
            inv.items.forEach(item => {
                salesCount[item.partSKU] = (salesCount[item.partSKU] || 0) + item.quantity;
            });
        });

        const bestSellingParts = Object.entries(salesCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([partSKU, totalSold]) => {
                const part = parts.find(p => p.partSKU === partSKU);
                return { partSKU, partName: part?.partName || 'N/A', totalSold };
            });

        return { totalRevenue, totalExpenses, profit, monthlyData: chartData, bestSellingParts };
    },
};
