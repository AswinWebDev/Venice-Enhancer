import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MobileTopBar: React.FC = () => {
  const { toggleSidebar } = useApp();

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center">
        <span className="font-semibold text-lg text-venice-red">
          Venice
        </span>
        <span className="font-semibold text-lg text-gray-900 ml-1">
          Enhancer
        </span>
      </div>
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
    </div>
  );
};

export default MobileTopBar;
