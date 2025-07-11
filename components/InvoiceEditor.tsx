
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Invoice, InvoiceItem, Customer, Part } from '../types';
import { InvoiceStatus } from '../types';
import { api } from '../services/mockApi';
import Button from './common/Button';
import { TrashIcon } from './icons/Icons';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partSearch, setPartSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isNewInvoice = !id;
  
  const init = useCallback(async () => {
    setIsLoading(true);
    try {
      const [customersData, partsData] = await Promise.all([
        api.getCustomers(),
        api.getParts()
      ]);
      setCustomers(customersData);
      setParts(partsData);

      if (isNewInvoice) {
        setInvoice({
          id: `INV-${Date.now()}`,
          invoiceNumber: await api.getNextInvoiceNumber(),
          customerId: customersData.length > 0 ? customersData[0].id : '',
          date: new Date().toISOString().split('T')[0],
          status: InvoiceStatus.Draft,
          items: [],
        });
      } else {
        const invoiceData = await api.getInvoiceById(id);
        if (invoiceData) setInvoice(invoiceData);
        else {
            addNotification('error', t('invoiceEditor.notifications.notFound'));
            navigate('/invoices');
        }
      }
    } catch (error) {
      console.error("Failed to load invoice data", error);
      addNotification('error', t('invoiceEditor.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, isNewInvoice, navigate, addNotification, t]);

  useEffect(() => {
    init();
  }, [init]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!invoice) return;
    const newItems = [...invoice.items];
    (newItems[index] as any)[field] = value;
    if (field === 'unitPrice' || field === 'quantity') {
      (newItems[index] as any)[field] = parseFloat(value) || 0;
    }
    setInvoice({ ...invoice, items: newItems });
  };
  
  const addPartToInvoice = (part: Part) => {
    if (!invoice || invoice.items.some(item => item.partSKU === part.partSKU)) {
        addNotification('info', t('invoiceEditor.notifications.itemExists'));
        return;
    };
    const newItem: InvoiceItem = {
      partSKU: part.partSKU,
      description: part.description || part.partName,
      quantity: 1,
      unitPrice: part.sellingPrice,
    };
    setInvoice({ ...invoice, items: [...invoice.items, newItem] });
    setPartSearch('');
  };

  const removeItem = (index: number) => {
    if (!invoice) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const handleSave = async () => {
    if (!invoice) return;

    if (invoice.status !== InvoiceStatus.Draft && invoice.items.length === 0) {
      addNotification('error', t('invoiceEditor.notifications.noItemsError'));
      return;
    }
    
    try {
        const savedInvoice = await api.saveInvoice(invoice);
        addNotification('success', t('invoiceEditor.notifications.saveSuccess', {number: savedInvoice.invoiceNumber}));
        navigate('/invoices');
    } catch(e) {
        console.error("Failed to save invoice", e);
        addNotification('error', t('invoiceEditor.notifications.saveError'));
    }
  };

  if (isLoading || settingsLoading || !invoice || !settings) {
      return <div className="text-center p-10">{t('invoiceEditor.loading')}</div>;
  }

  const totalHT = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalTVA = totalHT * settings.vatRate;
  const totalTTC = totalHT + totalTVA;
  const currencySymbol = settings.currencySymbol;
  const statusOptions = Object.values(InvoiceStatus);

  const filteredParts = partSearch ? parts.filter(p => 
      (p.partName.toLowerCase().includes(partSearch.toLowerCase()) || 
       p.partSKU.toLowerCase().includes(partSearch.toLowerCase())) && p.quantityInStock > 0
  ).slice(0, 5) : [];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h2>
          <select name="status" value={invoice.status} onChange={handleInvoiceChange} className="mt-2 bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white focus:ring-blue-500 focus:border-blue-500">
            {statusOptions.map(s => <option key={s} value={s}>{t(`status.${s.toLowerCase()}`)}</option>)}
          </select>
        </div>
        <div className="text-end">
          <label className="block text-sm font-medium text-gray-300">{t('invoiceEditor.customerLabel')}</label>
          <select name="customerId" value={invoice.customerId} onChange={handleInvoiceChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="block text-sm font-medium text-gray-300 mt-2">{t('invoiceEditor.dateLabel')}</label>
          <input type="date" name="date" value={invoice.date.split('T')[0]} onChange={handleInvoiceChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-700">
          <thead><tr>
            <th className="px-4 py-2 text-start text-xs font-medium text-gray-300 uppercase">{t('invoiceEditor.table.description')}</th>
            <th className="px-4 py-2 text-start text-xs font-medium text-gray-300 uppercase">{t('invoiceEditor.table.qty')}</th>
            <th className="px-4 py-2 text-start text-xs font-medium text-gray-300 uppercase">{t('invoiceEditor.table.unitPrice')}</th>
            <th className="px-4 py-2 text-start text-xs font-medium text-gray-300 uppercase">{t('invoiceEditor.table.totalHT')}</th>
            <th className="px-4 py-2 text-start text-xs font-medium text-gray-300 uppercase"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-700">
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2"><input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full bg-gray-700/50 rounded p-1"/></td>
                <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-20 bg-gray-700/50 rounded p-1"/></td>
                <td className="px-4 py-2"><input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="w-24 bg-gray-700/50 rounded p-1"/></td>
                <td className="px-4 py-2 font-semibold">{(item.quantity * item.unitPrice).toFixed(2)} {currencySymbol}</td>
                <td className="px-4 py-2"><button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Part Section */}
      <div className="relative mb-6">
        <input type="text" placeholder={t('invoiceEditor.searchPlaceholder')} value={partSearch} onChange={e => setPartSearch(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
        {filteredParts.length > 0 && (
          <ul className="absolute z-10 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
            {filteredParts.map(part => (
              <li key={part.partSKU} onClick={() => addPartToInvoice(part)} className="px-3 py-2 cursor-pointer hover:bg-blue-600">
                {part.partName} ({part.partSKU}) - {t('invoiceEditor.stockLabel')}: {part.quantityInStock}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals & Actions */}
      <div className="flex justify-between items-end">
        <div>
          <Button variant="secondary" onClick={() => navigate('/invoices')}>{t('common.cancel')}</Button>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <p className="text-gray-400">{t('invoiceEditor.totalHT')}: <span className="font-semibold text-white w-32 inline-block text-end">{totalHT.toFixed(2)} {currencySymbol}</span></p>
            <p className="text-gray-400">{t('invoiceEditor.vatAmount', {rate: settings.vatRate * 100})}: <span className="font-semibold text-white w-32 inline-block text-end">{totalTVA.toFixed(2)} {currencySymbol}</span></p>
            <p className="font-bold text-xl text-white">{t('invoiceEditor.totalTTC')}: <span className="w-32 inline-block text-end">{totalTTC.toFixed(2)} {currencySymbol}</span></p>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;
