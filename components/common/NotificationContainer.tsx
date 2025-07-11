
import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { PlusIcon } from '../icons/Icons'; // Using PlusIcon's X shape for close button

const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  const baseClasses = 'relative w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center space-x-4';
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
        <PlusIcon className="h-4 w-4 transform rotate-45" />
      </button>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
