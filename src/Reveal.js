import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

export function RevealTop({ children, trigger, reverse }) {
  const [key, setKey] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    if (trigger) {
      setKey(prevKey => prevKey + 1); // Change the key to force re-render
    }
  }, [trigger]);

  return (
    <motion.div
      key={key}
      ref={ref}
      initial={{ opacity: 0, x: reverse ? 50 : -50 }}
      animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : (reverse ? 50 : -50) }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealBot({ children, trigger, reverse }) {
  const [key, setKey] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    if (trigger) {
      setKey(prevKey => prevKey + 1); // Change the key to force re-render
    }
  }, [trigger]);

  return (
    <motion.div
      key={key}
      ref={ref}
      initial={{ opacity: 0, x: reverse ? 0 : 20 }}
      animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : (reverse ? -20 : 20) }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
