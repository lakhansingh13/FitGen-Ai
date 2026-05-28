'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'chart';
  count?: number;
}

export default function SkeletonLoader({ type = 'card', count = 1 }: SkeletonLoaderProps) {
  const shimmerAnimation = {
    x: ['-100%', '100%'],
  };

  const shimmerTransition: any = {
    repeat: Infinity,
    duration: 1.6,
    ease: "linear",
  };

  const ShimmerOverlay = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      animate={shimmerAnimation}
      transition={shimmerTransition}
    />
  );

  const renderCardSkeleton = (idx: number) => (
    <div key={idx} className="glass-panel rounded-3xl p-6 relative overflow-hidden space-y-4 border border-white/5 min-h-[160px]">
      <ShimmerOverlay />
      
      {/* Header Line */}
      <div className="flex justify-between items-center">
        <div className="w-1/3 h-4 bg-white/5 rounded-lg" />
        <div className="w-8 h-8 bg-white/5 rounded-xl" />
      </div>

      {/* Main Stat */}
      <div className="w-1/2 h-10 bg-white/5 rounded-xl" />

      {/* Footer Details */}
      <div className="w-full h-4 bg-white/5 rounded-lg border-t border-white/5 pt-4" />
    </div>
  );

  const renderListSkeleton = (idx: number) => (
    <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/3 border border-white/5 relative overflow-hidden">
      <ShimmerOverlay />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="space-y-1.5">
          <div className="w-24 h-3 bg-white/5 rounded-md" />
          <div className="w-32 h-2.5 bg-white/5 rounded-md" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <div className="w-12 h-3 bg-white/5 rounded-md ml-auto" />
        <div className="w-16 h-2.5 bg-white/5 rounded-md ml-auto" />
      </div>
    </div>
  );

  const renderChartSkeleton = (idx: number) => (
    <div key={idx} className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-white/5">
      <ShimmerOverlay />
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/4 h-5 bg-white/5 rounded-lg" />
        <div className="w-24 h-5 bg-white/5 rounded-lg" />
      </div>
      {/* Mocking bar/area chart lines */}
      <div className="flex-1 flex items-end gap-3 px-2">
        <div className="flex-1 bg-white/3 rounded-t-xl h-[40%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[75%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[50%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[85%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[60%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[95%]" />
        <div className="flex-1 bg-white/3 rounded-t-xl h-[45%]" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => {
        if (type === 'card') return renderCardSkeleton(idx);
        if (type === 'list') return renderListSkeleton(idx);
        if (type === 'chart') return renderChartSkeleton(idx);
        return null;
      })}
    </div>
  );
}
