import React from 'react';
import { Sidebar, TopBar } from '../components/Navigation';
import { AnimatedGridPattern, cn } from '../components/AnimatedGridPattern';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="relative flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      <AnimatedGridPattern
        numSquares={45}
        maxOpacity={0.25}
        duration={5}
        repeatDelay={1.0}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] [-webkit-mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "absolute inset-0 h-full w-full",
          "text-[#14B8A6] dark:text-[#14B8A6]",
          "-skew-y-12 scale-150 origin-center pointer-events-none"
        )}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
