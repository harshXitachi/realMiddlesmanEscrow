import { motion } from "framer-motion";
import { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type SlideInProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
};

export function SlideIn({ children, direction = "up", delay = 0, className }: SlideInProps) {
  const directionMap = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 }
  };
  
  const { x, y } = directionMap[direction];
  
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4 }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingElement({ children, className, slow = false }: { children: ReactNode; className?: string; slow?: boolean }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: slow ? 4 : 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}
