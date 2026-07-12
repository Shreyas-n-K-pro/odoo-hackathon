import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, icon, className = '', ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg flex items-center gap-2 transition-all duration-200';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantStyles = {
      primary: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50',
      secondary: 'bg-aqua-600 text-white hover:bg-aqua-700 active:bg-aqua-800 disabled:opacity-50',
      outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900 disabled:opacity-50',
      ghost: 'text-teal-600 hover:bg-light-divider dark:hover:bg-dark-card disabled:opacity-50',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
