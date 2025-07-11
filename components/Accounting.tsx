
import React, { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics, Expense } from '../types';
import { api } from '../services/mockApi';
import { PlusIcon, TrashIcon } from './icons/Icons';
import Button from './common/Button';
import Modal from './common/Modal';
import { useSettings } from '../contexts/SettingsContext';
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


const Accounting = () => {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { addNotification } = useNotifications();
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsData, expensesData] = await Promise.all([
        api.getDashboardMetrics(),
        api.getExpenses()
      ]);
      setMetrics(metricsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Failed to fetch accounting data", error);
      addNotification('error', t('accounting.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.description || isNaN(amount) || amount <= 0) {
      addNotification('error', t('accounting.notifications.fillFieldsError'));
      return;
    }
    await api.addExpense({
      date: new Date().toISOString(),
      description: newExpense.description,
      amount,
    });
    setNewExpense({ description: '', amount: '' });
    addNotification('success', t('accounting.notifications.expenseAddedSuccess'));
    fetchData(); // Refresh all data
  };
  
  const confirmDeleteExpense = async () => {
    if (expenseToDelete) {
        try {
            await api.deleteExpense(expenseToDelete);
            addNotification('info', t('accounting.notifications.expenseDeletedSuccess'));
            setExpenseToDelete(null);
            fetchData(); // Refresh all data after deletion
        } catch (error) {
            console.error("Failed to delete expense", error);
            addNotification('error', t('accounting.notifications.expenseDeletedError'));
        }
    }
  };

  const currencySymbol = settings?.currencySymbol || '';

  if (isLoading || settingsLoading) {
    return <div className="text-center p-10">{t('common.loadingData')}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">{t('pageTitles.accounting')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Expense Management */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg mb-4 text-white">{t('accounting.addExpense')}</h3>
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <input
                    type="text"
                    placeholder={t('accounting.expenseDescriptionPlaceholder')}
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                    type="number"
                    placeholder={`${t('accounting.expenseAmountPlaceholder')} (${currencySymbol})`}
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button type="submit" className="w-full">
                    <PlusIcon className="h-5 w-5 me-2"/>
                    {t('accounting.addExpenseButton')}
                    </Button>
                </form>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-4 text-white">{t('accounting.allExpenses')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{t('accounting.table.description')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{t('accounting.table.date')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{t('accounting.table.amount')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{t('accounting.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{exp.description}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{new Date(exp.date).toLocaleDateString(`${language}-${language.toUpperCase()}`)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-red-400">{exp.amount.toFixed(2)} {currencySymbol}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                           <button onClick={() => setExpenseToDelete(exp.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
        
        {/* Reports */}
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg mb-4 text-white">{t('accounting.reports')}</h3>
                <div className="bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-md mb-4 text-gray-200">{t('accounting.bestSellingParts')}</h4>
                <ul className="space-y-3">
                    {metrics?.bestSellingParts.map(part => (
                    <li key={part.partSKU} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{part.partName} ({part.partSKU})</span>
                        <span className="font-bold bg-blue-600 text-white px-2 py-1 rounded-full text-xs">{t('accounting.sold', { count: part.totalSold })}</span>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
        </div>
      </div>
       {expenseToDelete && (
        <ConfirmationModal
          title={t('accounting.deleteExpenseConfirm')}
          message={t('accounting.deleteExpenseConfirm')}
          onConfirm={confirmDeleteExpense}
          onClose={() => setExpenseToDelete(null)}
        />
      )}
    </div>
  );
};

export default Accounting;