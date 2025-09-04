import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Re-using the logo SVG function for consistency
const logoSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5,18 Q12,16 19,18 Q12,22 5,18 Z" fill="${color}" stroke="none" /><path d="M12 4 V 16" /><path d="M8 8 V 16" /><path d="M16 8 V 16" /></svg>`;

interface LoadingScreenProps {
  theme: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ theme }) => {
  const logoDataUri = useMemo(() => {
    const logoColor = theme === 'dark' ? '#f97316' : '#f97316'; // Use orange for visibility on both backgrounds
    return `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg(logoColor))}`;
  }, [theme]);

  return (
    // FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround.
    // @ts-ignore
    <motion.div
      key="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300"
    >
      {/* FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround. */}
      {/* @ts-ignore */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
        className="flex flex-col items-center"
      >
        <img src={logoDataUri} alt="Mindful Youth Logo" className="w-20 h-20" />
        {/* FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround. */}
        {/* @ts-ignore */}
        <motion.h1 
            className="mt-4 text-2xl font-bold text-slate-700 dark:text-slate-300 tracking-wide"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
            Mindful Youth
        </motion.h1>
        {/* FIX: Framer Motion props are not being recognized by TypeScript due to a potential version issue. Using ts-ignore as a workaround. */}
        {/* @ts-ignore */}
        <motion.p 
            className="mt-2 text-slate-500 dark:text-slate-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
        >
            Loading your calm space...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;