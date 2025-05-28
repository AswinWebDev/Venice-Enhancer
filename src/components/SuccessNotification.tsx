import { XCircle, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center">
      <CheckCircle2 size={24} className="mr-3" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-green-100">
        <XCircle size={20} />
      </button>
    </div>
  );
};

export default SuccessNotification;
