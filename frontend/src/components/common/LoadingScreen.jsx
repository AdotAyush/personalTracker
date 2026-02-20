import { motion } from 'framer-motion';
import { ZapIcon } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
        >
          <ZapIcon className="w-6 h-6 text-white" />
        </motion.div>
        <div className="text-zinc-400 text-sm animate-pulse">Loading...</div>
      </motion.div>
    </div>
  );
}
