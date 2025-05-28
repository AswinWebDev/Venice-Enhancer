import React from 'react';
import { Clock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const Sidebar: React.FC = () => {
  const { history, isSidebarOpen, toggleSidebar } = useApp();

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-10 
        transform transition-transform duration-300 ease-in-out 
        shadow-lg 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <span className="font-semibold text-xl text-venice-red">
            Venice
          </span>
          <span className="font-semibold text-xl text-gray-900 ml-1.5">
            Enhancer
          </span>
        </div>
        {/* This button is for mobile overlay mode, hidden on md+ screens */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">History</h2>
      </div> */}
      
      <div className="p-4 overflow-y-auto h-[calc(100vh-128px)]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Clock size={40} className="mb-3 opacity-50" />
            <p>Your enhancement history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="aspect-square w-full mb-2 overflow-hidden rounded-md bg-gray-200">
                  <img 
                    src={item.enhancedImage} 
                    alt="Enhanced" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{item.settings.scale} • {item.settings.creativity.toFixed(1)} creativity</span>
                  <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;