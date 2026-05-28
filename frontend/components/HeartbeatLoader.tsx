'use client';

import { motion } from 'framer-motion';

interface HeartbeatLoaderProps {
  text?: string;
}

export default function HeartbeatLoader({ text = 'Analyzing Vital Metrics...' }: HeartbeatLoaderProps) {
  // SVG Path for an ECG / Heartbeat pulse
  const ecgPath = "M 10,50 L 40,50 L 50,30 L 58,75 L 68,15 L 75,55 L 82,50 L 110,50";

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative w-36 h-20 flex items-center justify-center">
        {/* Glowing Background Glow */}
        <div className="absolute inset-0 bg-neon-green/5 rounded-full blur-xl animate-pulse" />

        {/* Animated ECG Pulse */}
        <motion.svg
          viewBox="0 0 120 100"
          className="w-full h-full text-neon-green filter drop-shadow-[0_0_8px_#39ff14]"
          style={{ overflow: 'visible' }}
        >
          {/* Static gray baseline */}
          <path
            d={ecgPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated pulsing path */}
          <motion.path
            d={ecgPath}
            fill="none"
            stroke="#39ff14"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: [0, 0.4, 0.4, 0.8, 1, 1],
              pathOffset: [0, 0, 0.2, 0.4, 0.6, 1],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.svg>
      </div>

      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-center"
      >
        <span className="text-xs font-black tracking-widest text-neon-green uppercase drop-shadow-[0_0_4px_#39ff14]/30">
          {text}
        </span>
      </motion.div>
    </div>
  );
}
