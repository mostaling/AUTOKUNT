
import React, { useState, useEffect, useCallback } from 'react';
import type { Part, PartCondition } from '../types';
import { api } from '../services/mockApi';
import { generatePartDescription } from '../services/geminiService';
import Button from './common/Button';
import Modal from './common/Modal';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, SparklesIcon } from './icons/Icons';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const ConfirmationModal: React.FC<{ onConfirm: () => void; onClose: () => void; message: string; }> = ({ onConfirm, onClose, message }) => (
    <Modal title="Confirmation" onClose={onClose}>
        <div className="space-y-6">
            <p>{message}</p>
            <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm}>Confirm</Button>
            </div>
        </div>
    </Modal>
);

const StockManagement = () => {
  const { settings } = useSettings();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [partToDelete, setPartToDelete] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    setIsLoading(true);
    try {
      const partsData = await api.getParts();
      setParts(partsData);
    } catch (error) {
      console.error("Failed to fetch parts", error);
      addNotification('error', t('stock.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleOpenModal = (part: Part | null = null) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPart(null);
  };

  const handleSavePart = async (part: Part) => {
    await api.savePart(part);
    addNotification('success', t('stock.notifications.saveSuccess', { sku: part.partSKU }));
    fetchParts();
    handleCloseModal();
  };

  const confirmDeletePart = async () => {
    if (partToDelete) {
      await api.deletePart(partToDelete);
      addNotification('info', t('stock.notifications.deleteSuccess', { sku: partToDelete }));
      setParts(prevParts => prevParts.filter(p => p.partSKU !== partToDelete));
      setPartToDelete(null);
    }
  };

  const filteredParts = parts.filter(part =>
    part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partSKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.sourceVehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.sourceVehicleMake.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('stock.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg py-2 ps-10 pe-4 text-white focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
          />
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 me-2" />
          {t('stock.addPartButton')}
        </Button>
      </div>

      {isLoading ? <div className="text-center">{t('common.loading')}</div> : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  {[t('stock.table.sku'), t('stock.table.name'), t('stock.table.vehicle'), t('stock.table.condition'), t('stock.table.price'), t('stock.table.stock'), t('stock.table.actions')].map(header => (
                     <th key={header} scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-300 uppercase tracking-wider">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredParts.map(part => (
                  <tr key={part.partSKU} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{part.partSKU}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{part.partName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{`${part.sourceVehicleMake} ${part.sourceVehicleModel} (${part.sourceVehicleYear})`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        part.condition === 'grade_a' ? 'bg-green-200 text-green-800' :
                        part.condition === 'grade_b' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {t(`conditions.${part.condition}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{part.sellingPrice.toFixed(2)} {settings?.currencySymbol}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${part.quantityInStock <= 2 ? 'text-red-400' : 'text-white'}`}>{part.quantityInStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(part)} className="text-blue-400 hover:text-blue-300"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => setPartToDelete(part.partSKU)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isModalOpen && <PartFormModal part={editingPart} onSave={handleSavePart} onClose={handleCloseModal} />}
      {partToDelete && <ConfirmationModal message={t('stock.deleteConfirm')} onConfirm={confirmDeletePart} onClose={() => setPartToDelete(null)} />}
    </div>
  );
};

const PartFormModal: React.FC<{ part: Part | null, onSave: (part: Part) => void, onClose: () => void }> = ({ part, onSave, onClose }) => {
  const { settings } = useSettings();
  const { addNotification } = useNotifications();
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState<Part>(part || {
    partSKU: '', partName: '', description: '', sourceVehicleMake: '', sourceVehicleModel: '', sourceVehicleYear: new Date().getFullYear(),
    condition: 'grade_a', warehouseLocation: '', purchasePrice: 0, sellingPrice: 0, quantityInStock: 1, photos: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  const conditionOptions: PartCondition[] = ['grade_a', 'grade_b', 'for_parts'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.endsWith('Price') || name.endsWith('Year') || name.endsWith('Stock') ? parseFloat(value) || 0 : value }));
  };

  const handleGenerateDesc = async () => {
    setIsGenerating(true);
    try {
        const desc = await generatePartDescription(formData, language, t);
        setFormData(prev => ({ ...prev, description: desc }));
        addNotification('success', t('stock.notifications.descGeneratedSuccess'));
    } catch (error) {
        console.error(error);
        addNotification('error', t('stock.notifications.descGeneratedError'));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partSKU || !formData.partName || formData.sellingPrice <= 0) {
      addNotification('error', t('stock.notifications.fillRequiredFields'));
      return;
    }
    onSave(formData);
  };
  
  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500";

  return (
    <Modal title={part ? t('stock.modal.editTitle') : t('stock.modal.addTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pe-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.sku')} *</label><input type="text" name="partSKU" value={formData.partSKU} onChange={handleChange} className={inputClass} disabled={!!part} required/></div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.name')} *</label><input type="text" name="partName" value={formData.partName} onChange={handleChange} className={inputClass} required/></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">{t('stock.form.description')}</label>
          <div className="relative">
            <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputClass} pe-10`} rows={3}></textarea>
            <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="absolute top-2 end-2 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-500">
                {isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <SparklesIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.vehicleMake')}</label><input type="text" name="sourceVehicleMake" value={formData.sourceVehicleMake} onChange={handleChange} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.vehicleModel')}</label><input type="text" name="sourceVehicleModel" value={formData.sourceVehicleModel} onChange={handleChange} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.vehicleYear')}</label><input type="number" name="sourceVehicleYear" value={formData.sourceVehicleYear} onChange={handleChange} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.condition')}</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className={inputClass}>
              {conditionOptions.map(cond => <option key={cond} value={cond}>{t(`conditions.${cond}`)}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.location')}</label><input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.purchasePrice')} ({settings?.currencySymbol})</label><input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.sellingPrice')} ({settings?.currencySymbol}) *</label><input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className={inputClass} required/></div>
          <div><label className="block text-sm font-medium text-gray-300">{t('stock.form.quantity')}</label><input type="number" name="quantityInStock" value={formData.quantityInStock} onChange={handleChange} className={inputClass} /></div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit">{part ? t('common.save') : t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default StockManagement;