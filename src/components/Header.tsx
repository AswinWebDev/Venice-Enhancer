import React from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header: React.FC = () => {
  const { toggleSidebar } = useApp();

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md mr-3 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-lg text-venice-red">
              Venice
            </span>
            <span className="font-semibold text-lg text-gray-900 ml-1">
              Enhancer
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;