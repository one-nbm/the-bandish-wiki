"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-m3-surface-container dark:bg-m3-surface-container-dark rounded-full flex items-center justify-center mb-6 border border-m3-surface-high dark:border-m3-surface-high-dark">
          <span className="material-symbols-rounded text-5xl sm:text-6xl text-m3-primary dark:text-m3-primary-dark opacity-80" style={{ fontVariationSettings: '"wght" 300' }}>
            music_off
          </span>
        </div>
        
        <h1 
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3"
          style={{ fontVariationSettings: '"wdth" 110' }}
        >
          404 Not Found
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
          Oops! Looks like this composition got lost in the aalap. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/"
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-m3-primary dark:bg-m3-primary-dark hover:bg-m3-primary/90 transition-all duration-300 active:scale-95 hover:scale-[1.05]"
        >
          <span className="material-symbols-rounded text-[1.2rem]">home</span>
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
}
