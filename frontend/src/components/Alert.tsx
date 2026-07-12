import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
}

const alertConfig = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
};

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
