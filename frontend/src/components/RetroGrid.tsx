import React from 'react';

interface RetroGridProps {
  className?: string;
  angle?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({ className = '', angle = 70 }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
      {/* 3D Perspective container */}
      <div className="absolute inset-0 [perspective:250px]">
        {/* Grid floor: positioned at h/2 (top-1/2), covering full width, rotating from the top origin */}
        <div
          className="absolute top-1/2 left-0 w-full h-[150%] origin-top"
          style={{
            transform: `rotateX(${angle}deg)`,
          }}
        >
          {/* Moving grid lines with enhanced opacity */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,184,166,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,184,166,0.45)_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{
              animation: 'retro-grid-scroll 10s linear infinite',
            }}
          />
        </div>
      </div>

      {/* Horizon mask fading down from the middle section */}
      <div className="absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-[#F7FAFC] via-[#F7FAFC]/80 to-transparent dark:from-[#091A20] dark:via-[#091A20]/80 dark:to-transparent z-10" />

      <style>{`
        @keyframes retro-grid-scroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 50px;
          }
        }
      `}</style>
    </div>
  );
};
