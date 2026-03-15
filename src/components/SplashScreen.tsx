import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnimationComplete = () => {
    if (!isVisible) {
      onComplete();
    }
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "#ffffff" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          {/* Subtle background circles */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 560,
              height: 560,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              background:
                "radial-gradient(circle, hsl(221 83% 47% / 0.07) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 320,
              height: 320,
              bottom: "15%",
              right: "10%",
              background:
                "radial-gradient(circle, hsl(175 65% 36% / 0.06) 0%, transparent 70%)",
            }}
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Decorative ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 320,
              height: 320,
              border: "1px solid hsl(221 83% 47% / 0.1)",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 240,
              height: 240,
              border: "1px dashed hsl(175 65% 36% / 0.12)",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center px-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.15,
              }}
              className="relative mb-6"
            >
              {/* Soft shadow behind logo */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "hsl(221 83% 47% / 0.12)",
                  filter: "blur(20px)",
                  transform: "scale(0.9) translateY(8px)",
                }}
              />
              <img
                src={logo}
                alt="HududInfo.uz"
                className="relative rounded-2xl"
                style={{
                  width: 220,
                  height: "auto",
                  boxShadow:
                    "0 8px 32px hsl(221 83% 47% / 0.15), 0 2px 8px hsl(215 30% 12% / 0.08)",
                }}
                draggable={false}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              style={{
                fontSize: "13px",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 500,
                color: "hsl(215 14% 52%)",
                textAlign: "center",
                marginBottom: "2rem",
                letterSpacing: "0.01em",
              }}
            >
              Hududlar infratuzilmasi monitoring tizimi
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="relative overflow-hidden rounded-full"
              style={{
                width: 180,
                height: 3,
                background: "hsl(214 20% 90%)",
              }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "hsl(221 83% 47%)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  delay: 0.95,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Dot indicators */}
            <motion.div
              className="flex gap-1.5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: "hsl(221 83% 47%)",
                  }}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    delay: i * 0.28,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
