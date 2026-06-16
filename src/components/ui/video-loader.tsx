"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────
   VideoLoader — Cinematic loading screen with
   rotating golden Islamic star video
   ────────────────────────────────────────────── */

interface VideoLoaderProps {
  /** Video source for the loading animation */
  videoSrc?: string;
  /** Whether the app is still loading */
  isLoading: boolean;
  /** Maximum time to show loader (ms), even if isLoading is true */
  maxDuration?: number;
  /** App name to display (locale-aware) */
  appName?: string;
}

export function VideoLoader({
  videoSrc = "/videos/loading-transition.mp4",
  isLoading,
  maxDuration = 4000,
  appName = "فعاليات الكويت",
}: VideoLoaderProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Force hide after maxDuration
    const maxTimer = setTimeout(() => {
      setFadeOut(true);
    }, maxDuration);

    return () => clearTimeout(maxTimer);
  }, [maxDuration]);

  useEffect(() => {
    if (!isLoading) {
      // Buffer: let the page render underneath before fading
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 600);
      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (fadeOut) {
      const hideTimer = setTimeout(() => {
        setShowLoader(false);
      }, 800); // Match exit animation duration
      return () => clearTimeout(hideTimer);
    }
  }, [fadeOut]);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        >
          {/* Video */}
          <motion.video
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          >
            <source src={videoSrc} type="video/mp4" />
          </motion.video>

          {/* Center overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* App name */}
            <motion.div
              className="gradient-text text-2xl sm:text-3xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {appName}
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="mt-6 h-0.5 w-24 rounded-full overflow-hidden bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Dark vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, oklch(0.10 0.02 260 / 70%) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VideoLoader;
