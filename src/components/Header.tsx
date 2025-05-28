import React from 'react';
import VeniceLogoBlack from '../assets/venice-keys-black.png';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-venice-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={VeniceLogoBlack} alt="Venice AI Logo" className="h-8 w-auto mr-3" />
            <span className="font-semibold text-xl text-venice-deep-olive">
              Venice
            </span>
            <span className="font-semibold text-xl text-venice-olive-brown ml-1">
              Enhancer
            </span>
          </div>
          {/* Optional: Add any right-aligned header items here */}
        </div>
      </div>
    </header>
  );
};

export default Header;