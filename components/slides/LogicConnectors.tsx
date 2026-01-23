import React from 'react';
import { motion } from 'framer-motion';

export const LogicConnectors = ({ color }: { color: string }) => {
  return (
    <div className="w-full h-full flex justify-center items-start overflow-visible">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 50">
        <motion.path
          d="M 270 0 L 270 25 L 730 25 L 730 0" 
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeOpacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
        />
        <motion.path
          d="M 500 25 L 500 50" 
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeOpacity="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4 }}
        />
        <circle cx="500" cy="25" r="5" fill={color} className="animate-pulse" />
      </svg>
    </div>
  );
};
