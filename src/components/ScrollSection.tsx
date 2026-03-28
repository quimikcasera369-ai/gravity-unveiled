import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function ScrollSection({ children, className = '', id }: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3, once: false });

  return (
    <section
      ref={ref}
      id={id}
      className={`cosmic-section ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6"
      >
        {children}
      </motion.div>
    </section>
  );
}
