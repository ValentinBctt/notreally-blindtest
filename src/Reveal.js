import { useEffect, useState, useRef } from 'react';
import { useAnimation } from 'framer-motion';
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

export const RevealPoint = ({ children, width = "fit-content" }) => {
  const ref = useRef(null);
  const { ref: inViewRef, inView: isInView } = useInView(ref, { triggerOnce: true });

  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    } else {
      mainControls.start("hidden");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref}>
      <motion.div
        ref={inViewRef}
        animate={mainControls}
        initial="hidden"
        transition={{ duration: 0.5, delay: 0.25 }}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 50 },
        }}
        style={{ position: 'absolute', top: '-50px', right: '10px', width: width }}
      >
        {children}
      </motion.div>
    </div>
  );
};
