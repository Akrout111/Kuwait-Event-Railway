"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ──────────────────────────────────────────────
   VideoHoverCard — Plays video overlay on hover
   Inspired by Disney+/Netflix card interaction
   ────────────────────────────────────────────── */

interface VideoHoverCardProps {
  /** Video source to play on hover */
  videoSrc: string;
  /** Thumbnail / poster image (always visible) */
  thumbnail: string;
  /** Alt text for thumbnail */
  alt?: string;
  /** Hover delay before video starts (ms) */
  hoverDelay?: number;
  /** Children rendered on top (title, badges, etc.) */
  children?: React.ReactNode;
  /** Container className */
  className?: string;
  /** Whether to show the video (respects reduced-motion, data saver) */
  disabled?: boolean;
}

export function VideoHoverCard({
  videoSrc,
  thumbnail,
  alt = "",
  hoverDelay = 400,
  children,
  className,
  disabled = false,
}: VideoHoverCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazy load: only load video when card is near viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [disabled]);

  // Play/pause based on hover state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady || disabled) return;

    if (isHovered) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    // Pause video on unmount to prevent continued playback
    return () => {
      video.pause();
    };
  }, [isHovered, isVideoReady, disabled]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(true);
    }, hoverDelay);
  }, [disabled, hoverDelay]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  }, []);

  // Clean up tap auto-dismiss timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  // Mobile: tap to preview
  const handleTap = useCallback(() => {
    if (disabled) return;
    setIsHovered((prev) => !prev);
    if (!isHovered) {
      // Auto-dismiss after 3 seconds
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => setIsHovered(false), 3000);
    }
  }, [disabled, isHovered]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label={isHovered ? "إيقاف المعاينة" : "معاينة الفيديو"}
    >
      {/* Thumbnail — always rendered as base layer */}
      <motion.div
        className="w-full h-full relative"
        animate={{ opacity: isHovered && isVideoReady && !disabled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <Image
          src={thumbnail}
          alt={alt}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Video overlay — plays on hover */}
      {shouldLoadVideo && !disabled && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlayThrough={() => setIsVideoReady(true)}
          style={{
            opacity: isHovered && isVideoReady ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Golden particle shimmer overlay on hover */}
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background:
                "linear-gradient(to top, oklch(0.12 0.04 260 / 60%) 0%, transparent 40%, oklch(0.76 0.13 85 / 3%) 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Children content */}
      {children}
    </div>
  );
}

export default VideoHoverCard;
