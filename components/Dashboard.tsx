import React, { useState, useEffect, useCallback } from 'react';
import type { DashboardMetrics } from '../types';
import { api } from '../services/mockApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`bg-gray-800 p-6 rounded-lg shadow-lg border-s-4 ${color}`}>
    <h3 className="text-sm font-medium text-gray-400">{title}</h3>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
  </div>
);

const Dashboard = () => {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { addNotification } = useNotifications();
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const metricsData = await api.getDashboardMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      addNotification('error', t('dashboard.notifications.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const currencySymbol = settings?.currencySymbol || '';

  if (isLoading || settingsLoading) {
    return <div className="text-center p-10">{t('common.loadingData')}</div>;
  }

  if (!metrics) {
    return <div className="text-center p-10 text-red-400">{t('common.dataError')}</div>;
  }
  
  const getMonthName = (monthIndex: number) => {
      const date = new Date();
      date.setMonth(monthIndex);
      const locale = language === 'ar' ? 'ar-TN' : `${language}-${language.toUpperCase()}`;
      return date.toLocaleString(locale, { month: 'short' });
  }

  const chartData = metrics.monthlyData.map(d => ({
    name: `${getMonthName(d.month)} ${d.year}`,
    revenue: d.revenue,
    expenses: d.expenses,
  }));

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.totalRevenue')} value={`${metrics.totalRevenue.toFixed(2)} ${currencySymbol}`} color="border-green-500" />
        <StatCard title={t('dashboard.totalExpenses')} value={`${metrics.totalExpenses.toFixed(2)} ${currencySymbol}`} color="border-red-500" />
        <StatCard title={t('dashboard.netProfit')} value={`${metrics.profit.toFixed(2)} ${currencySymbol}`} color={metrics.profit >= 0 ? "border-blue-500" : "border-yellow-500"} />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="font-semibold text-lg mb-4 text-white">{t('dashboard.revenueVsExpensesChartTitle')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis dataKey="name" stroke="#a0aec0" />
            <YAxis stroke="#a0aec0" tickFormatter={(value) => `${value} ${currencySymbol}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', color: '#e2e8f0' }}
              labelStyle={{ color: '#a0aec0' }}
              formatter={(value: number) => `${value.toFixed(2)} ${currencySymbol}`}
            />
            <Legend wrapperStyle={{ color: '#a0aec0' }}/>
            <Bar dataKey="revenue" fill="#48bb78" name={t('dashboard.chart.revenue')} />
            <Bar dataKey="expenses" fill="#f56565" name={t('dashboard.chart.expenses')} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;