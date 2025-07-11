
import React from 'react';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;