
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Invoice, Customer } from '../types';
import { InvoiceStatus } from '../types';
import { api } from '../services/mockApi';
import { generateInvoicePDF } from '../services/pdfGenerator';
import Button from './common/Button';
import Modal from './common/Modal';
import { PlusIcon, PencilIcon, DownloadIcon, TrashIcon } from './icons/Icons';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const getStatusClass = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.Paid: return 'bg-green-200 text-green-800';
    case InvoiceStatus.Sent: return 'bg-blue-200 text-blue-800';
    case InvoiceStatus.Overdue: return 'bg-red-200 text-red-800';
    case InvoiceStatus.Draft: return 'bg-gray-200 text-gray-800';
    case InvoiceStatus.Cancelled: return 'bg-yellow-200 text-yellow-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const ConfirmationModal: React.FC<{ onConfirm: () => void; onClose: () => void; message: string; title: string }> = ({ onConfirm, onClose, message, title }) => {
    const { t } = useLanguage();
    return (
        <Modal title={title} onClose={onClose}>
            <div className="space-y-6">
                <p>{message}</p>
                <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                    <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                    <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">{t('common.confirm')}</Button>
                </div>
            </div>
        </Modal>
    )
};


const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invoicesData, customersData] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
      ]);
      setInvoices(invoicesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCustomers(customersData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      addNotification('error', t('invoices.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || t('invoices.unknownCustomer');
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!settings) {
        addNotification('error', t('invoices.notifications.settingsLoadError'));
        return;
    }
    const customer = await api.getCustomerById(invoice.customerId);
    if (customer) {
      generateInvoicePDF(invoice, customer, settings, language, t);
      addNotification('success', t('invoices.notifications.pdfSuccess', { number: invoice.invoiceNumber }));
    } else {
      addNotification('error', t('invoices.notifications.customerNotFoundError'));
    }
  };

  const handleDeleteInvoice = async () => {
    if (invoiceToDelete) {
        try {
            await api.deleteInvoice(invoiceToDelete);
            addNotification('info', t('invoices.notifications.deleteSuccess'));
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete));
            setInvoiceToDelete(null);
        } catch (error) {
            console.error("Failed to delete invoice", error);
            addNotification('error', t('invoices.notifications.deleteError'));
        }
    }
  };

  if (isLoading || settingsLoading) {
      return <div className="text-center p-10">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => navigate('/invoices/new')}>
          <PlusIcon className="h-5 w-5 me-2" />
          {t('invoices.createButton')}
        </Button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                {[t('invoices.table.number'), t('invoices.table.customer'), t('invoices.table.date'), t('invoices.table.total'), t('invoices.table.status'), t('invoices.table.actions')].map(header => (
                   <th key={header} scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {invoices.map(invoice => {
                  const total = invoice.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * (1 + (settings?.vatRate || 0));
                  return (
                      <tr key={invoice.id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.invoiceNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCustomerName(invoice.customerId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(invoice.date).toLocaleDateString(`${language}-${language.toUpperCase()}`)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{total.toFixed(2)} {settings?.currencySymbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                  {t(`status.${invoice.status.toLowerCase()}`)}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button onClick={() => navigate(`/invoices/${invoice.id}`)} className="text-blue-400 hover:text-blue-300"><PencilIcon className="h-5 w-5"/></button>
                              <button onClick={() => handleDownloadPDF(invoice)} className="text-green-400 hover:text-green-300"><DownloadIcon className="h-5 w-5"/></button>
                              <button onClick={() => setInvoiceToDelete(invoice.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                          </td>
                      </tr>
                  )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {invoiceToDelete && (
        <ConfirmationModal
          title={t('invoices.deleteConfirmTitle')}
          message={t('invoices.deleteConfirmMessage')}
          onConfirm={handleDeleteInvoice}
          onClose={() => setInvoiceToDelete(null)}
        />
      )}
    </div>
  );
};

export default InvoiceList;
