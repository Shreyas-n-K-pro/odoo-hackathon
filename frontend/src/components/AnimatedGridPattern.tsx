import React, { useEffect, useState } from 'react';

// Simple utility to merge class names dynamically
export function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

export const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = ({
  width = 40,
  height = 40,
  numSquares = 35,
  maxOpacity = 0.25,
  duration = 4,
  repeatDelay = 0.8,
  className,
}) => {
  const [squares, setSquares] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Generate randomized coordinates for the grid squares to animate
  useEffect(() => {
    const generatedSquares = Array.from({ length: numSquares }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 20) - 10,
      y: Math.floor(Math.random() * 16) - 8,
      delay: Math.random() * (duration + repeatDelay),
    }));
    setSquares(generatedSquares);
  }, [numSquares, duration, repeatDelay]);

  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
      }}
    >
      <svg x="50%" y="50%" className="overflow-visible">
        {squares.map((sq) => (
          <rect
            key={sq.id}
            width={width - 1}
            height={height - 1}
            x={sq.x * width + 1}
            y={sq.y * height + 1}
            fill="currentColor"
            opacity="0"
            style={{
              animation: `grid-fade-pulse ${duration}s ease-in-out infinite`,
              animationDelay: `${sq.delay}s`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes grid-fade-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: ${maxOpacity}; }
        }
      `}</style>
    </svg>
  );
};
