import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioControllerProps {
  isEnabled: boolean;
  onToggle: () => void;
  loadingSection: number | null;
}

export default function AudioController({ isEnabled, onToggle, loadingSection }: AudioControllerProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full border border-border/30 bg-background/80 backdrop-blur-md hover:bg-background/95 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {loadingSection !== null ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </motion.div>
        ) : isEnabled ? (
          <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Volume2 className="w-5 h-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-xs font-display tracking-wider uppercase text-muted-foreground">
        {isEnabled ? 'Narration On' : 'Enable Narration'}
      </span>

      {/* Audio wave animation when enabled */}
      {isEnabled && (
        <div className="flex items-center gap-[2px] ml-1">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="w-[2px] bg-primary rounded-full"
              animate={{ height: ['4px', '12px', '4px'] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}
