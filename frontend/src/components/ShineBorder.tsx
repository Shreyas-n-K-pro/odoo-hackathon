import React from 'react';

interface ShineBorderProps {
  shineColor?: string[];
  borderWidth?: number;
  duration?: number;
  className?: string;
}

export const ShineBorder: React.FC<ShineBorderProps> = ({
  shineColor = ['#14B8A6', '#0D9488', '#84CC16'], // Web page color palette (teal, aqua, lime)
  borderWidth = 2,
  duration = 6,
  className = '',
}) => {
  const colors = [...shineColor, shineColor[0]].join(', ');

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-0 ${className}`}>
      {/* Rotating gradient element */}
      <div
        className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `conic-gradient(from 0deg, ${colors})`,
          animation: `shine-spin ${duration}s linear infinite`,
        }}
      />
      {/* Inner backdrop cover which masks the center of the card */}
      <div
        className="absolute bg-light-card dark:bg-dark-card rounded-[6px]"
        style={{
          inset: `${borderWidth}px`,
        }}
      />
      <style>{`
        @keyframes shine-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
