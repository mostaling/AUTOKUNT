
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import InvoiceList from './components/InvoiceList';
import InvoiceEditor from './components/InvoiceEditor';
import CustomerManagement from './components/CustomerManagement';
import Settings from './components/Settings';
import NotificationContainer from './components/common/NotificationContainer';
import { useLanguage } from './contexts/LanguageContext';
import Accounting from './components/Accounting';

function App() {
  const location = useLocation();
  const { t } = useLanguage();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return t('pageTitles.dashboard');
      case '/stock':
        return t('pageTitles.stock');
      case '/invoices':
        return t('pageTitles.invoices');
      case '/invoices/new':
        return t('pageTitles.createInvoice');
      case '/customers':
        return t('pageTitles.customers');
      case '/accounting':
        return t('pageTitles.accounting');
      case '/settings':
        return t('pageTitles.settings');
      default:
        if (location.pathname.startsWith('/invoices/')) {
          return t('pageTitles.editInvoice');
        }
        return 'AutoPart-Manager';
    }
  };
  
  return (
    <>
      <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getPageTitle()} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stock" element={<StockManagement />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/new" element={<InvoiceEditor />} />
              <Route path="/invoices/:id" element={<InvoiceEditor />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
      <NotificationContainer />
    </>
  );
}

export default App;