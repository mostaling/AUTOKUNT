
import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import Button from './common/Button';
import type { AppSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
    const { settings, isLoading, saveSettings } = useSettings();
    const { addNotification } = useNotifications();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<AppSettings | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        setFormData({
            ...formData,
            companyInfo: {
                ...formData.companyInfo,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            await saveSettings(formData);
            addNotification('success', t('settings.notifications.saveSuccess'));
        } catch (error) {
            addNotification('error', t('settings.notifications.saveError'));
            console.error(error);
        }
    };

    if (isLoading || !formData) {
        return <div className="text-center p-10">{t('settings.loading')}</div>;
    }
    
    const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-white">{t('pageTitles.settings')}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-lg">
                {/* Company Info */}
                <div className="pb-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('settings.companyInfo.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>{t('settings.companyInfo.name')}</label><input type="text" name="name" value={formData.companyInfo.name} onChange={handleCompanyInfoChange} className={inputClass} /></div>
                        <div><label className={labelClass}>{t('settings.companyInfo.phone')}</label><input type="text" name="phone" value={formData.companyInfo.phone} onChange={handleCompanyInfoChange} className={inputClass} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>{t('settings.companyInfo.address')}</label><input type="text" name="address" value={formData.companyInfo.address} onChange={handleCompanyInfoChange} className={inputClass} /></div>
                        <div><label className={labelClass}>{t('settings.companyInfo.email')}</label><input type="email" name="email" value={formData.companyInfo.email} onChange={handleCompanyInfoChange} className={inputClass} /></div>
                        <div><label className={labelClass}>{t('settings.companyInfo.vatId')}</label><input type="text" name="vatId" value={formData.companyInfo.vatId} onChange={handleCompanyInfoChange} className={inputClass} /></div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="pb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('settings.financial.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>{t('settings.financial.vatRate')}</label>
                            <input type="number" step="1" name="vatRate" value={formData.vatRate * 100} onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value) / 100})} className={inputClass} />
                        </div>
                        <div><label className={labelClass}>{t('settings.financial.currencySymbol')}</label><input type="text" name="currencySymbol" value={formData.currencySymbol} onChange={handleSettingsChange} className={inputClass} /></div>
                        <div><label className={labelClass}>{t('settings.financial.currencyCode')}</label><input type="text" name="currencyCode" value={formData.currencyCode} onChange={handleSettingsChange} className={inputClass} /></div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit">{t('settings.saveButton')}</Button>
                </div>
            </form>
        </div>
    );
};

export default Settings;