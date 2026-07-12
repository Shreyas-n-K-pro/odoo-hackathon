import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, disabled = false }) => {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <div className="relative group inline-block">
      <div className="pointer-events-auto">{children}</div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-950 dark:bg-slate-900 text-slate-100 text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[100] text-center whitespace-normal min-w-[200px] max-w-[250px] border border-slate-800">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950 dark:border-t-slate-900" />
      </div>
    </div>
  );
};
