
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartBarIcon, CubeIcon, DocumentTextIcon, CogIcon, UserGroupIcon, CalculatorIcon } from '../icons/Icons';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useLanguage();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex-col justify-between hidden md:flex">
      <div>
        <div className="flex items-center mb-8 px-2">
          <CogIcon className="h-8 w-8 text-blue-400" />
          <span className="ms-3 text-xl font-bold text-white">AutoPart-Pro</span>
        </div>
        <nav className="space-y-2">
          <NavLink to="/" className={navLinkClasses}>
            <ChartBarIcon className="h-5 w-5 me-3" />
            {t('sidebar.dashboard')}
          </NavLink>
          <NavLink to="/stock" className={navLinkClasses}>
            <CubeIcon className="h-5 w-5 me-3" />
            {t('sidebar.stock')}
          </NavLink>
           <NavLink to="/customers" className={navLinkClasses}>
            <UserGroupIcon className="h-5 w-5 me-3" />
            {t('sidebar.customers')}
          </NavLink>
          <NavLink to="/invoices" className={navLinkClasses}>
            <DocumentTextIcon className="h-5 w-5 me-3" />
            {t('sidebar.invoices')}
          </NavLink>
          <NavLink to="/accounting" className={navLinkClasses}>
            <CalculatorIcon className="h-5 w-5 me-3" />
            {t('sidebar.accounting')}
          </NavLink>
        </nav>
      </div>
       <div>
        <nav className="space-y-2">
           <NavLink to="/settings" className={navLinkClasses}>
            <CogIcon className="h-5 w-5 me-3" />
            {t('sidebar.settings')}
          </NavLink>
        </nav>
        <div className="text-center text-xs text-gray-500 mt-6">
         <p>&copy; {new Date().getFullYear()} AutoPart-Manager Pro</p>
       </div>
       </div>
    </aside>
  );
};

export default Sidebar;
