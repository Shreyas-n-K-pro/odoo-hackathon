import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', elevated = false }) => {
  return (
    <div
      className={`
        bg-light-card dark:bg-dark-card
        ${elevated ? 'bg-light-card_elevated dark:bg-dark-card_elevated shadow-md' : 'shadow-sm'}
        rounded-lg p-6 border border-light-border dark:border-dark-border
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendValue, className = '' }) => {
  return (
    <Card className={`min-h-[140px] flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-light-secondary-text dark:text-dark-secondary-text text-sm font-medium">{title}</h3>
        {icon && <div className="text-2xl opacity-60">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-teal-600 dark:text-aqua-300">{value}</div>
        {trend && trendValue && (
          <div
            className={`text-sm font-semibold ${
              trend === 'up' ? 'text-lime-500' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
};
