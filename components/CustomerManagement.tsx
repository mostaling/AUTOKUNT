
import React, { useState, useEffect, useCallback } from 'react';
import type { Customer } from '../types';
import { api } from '../services/mockApi';
import Button from './common/Button';
import Modal from './common/Modal';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from './icons/Icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

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

const CustomerManagement = () => {
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      addNotification('error', t('customers.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async (customer: Customer) => {
    await api.saveCustomer(customer);
    addNotification('success', t('customers.notifications.saveSuccess', { name: customer.name }));
    fetchCustomers();
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
        try {
            await api.deleteCustomer(customerToDelete.id);
            addNotification('info', t('customers.notifications.deleteSuccess'));
            setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        } catch (error) {
            console.error("Failed to delete customer:", error);
            addNotification('error', t('customers.notifications.deleteError'));
        } finally {
            setCustomerToDelete(null);
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center"><UserGroupIcon className="h-6 w-6 me-3" />{t('customers.title')}</h2>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 me-2" />
          {t('customers.addButton')}
        </Button>
      </div>

      {isLoading ? <div className="text-center">{t('common.loading')}</div> : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  {[t('customers.table.name'), t('customers.table.email'), t('customers.table.phone'), t('customers.table.address'), t('customers.table.actions')].map(header => (
                     <th key={header} scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate">{customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(customer)} className="text-blue-400 hover:text-blue-300"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => setCustomerToDelete(customer)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isModalOpen && <CustomerFormModal customer={editingCustomer} onSave={handleSaveCustomer} onClose={handleCloseModal} />}
      {customerToDelete && (
        <ConfirmationModal
            title={t('customers.deleteConfirmTitle')}
            message={t('customers.deleteConfirmMessage', { name: customerToDelete.name })}
            onConfirm={handleConfirmDelete}
            onClose={() => setCustomerToDelete(null)}
        />
      )}
    </div>
  );
};

const CustomerFormModal: React.FC<{ customer: Customer | null, onSave: (customer: Customer) => void, onClose: () => void }> = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState<Customer>(customer || {
    id: `CUST-${Date.now()}`, name: '', address: '', phone: '', email: '', vatNumber: ''
  });
  const { addNotification } = useNotifications();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addNotification('error', t('customers.notifications.fillRequiredFields'));
      return;
    }
    onSave(formData);
  };
  
  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500";

  return (
    <Modal title={customer ? t('customers.modal.editTitle') : t('customers.modal.addTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-300">{t('customers.form.name')} *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium text-gray-300">{t('customers.form.email')} *</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-sm font-medium text-gray-300">{t('customers.form.phone')}</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-300">{t('customers.form.address')}</label><textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows={3}></textarea></div>
        <div><label className="block text-sm font-medium text-gray-300">{t('customers.form.vat')}</label><input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className={inputClass} /></div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit">{customer ? t('common.save') : t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerManagement;
