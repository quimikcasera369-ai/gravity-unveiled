import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <span className="text-xs text-muted-foreground font-display tracking-widest uppercase">Scroll to explore</span>
      <motion.div
        className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-1 h-2 rounded-full bg-primary"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
