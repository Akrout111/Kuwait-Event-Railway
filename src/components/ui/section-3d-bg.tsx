"use client";

/**
 * Section3DBg — Delegates to ThreeSectionBg (WebGL-based 3D backgrounds)
 * Maintains the same interface as the original Canvas 2D implementation
 * for backward compatibility with all existing imports.
 */

import { ThreeSectionBg } from "@/components/ui/three-section-bg";
import type { SectionTheme as ThreeSectionTheme } from "@/components/ui/three-section-bg";

// Re-export with the original interface name
export type SectionTheme = ThreeSectionTheme;

interface Section3DBgProps {
  theme?: SectionTheme;
  className?: string;
}

function Section3DBg({ theme = "hero", className }: Section3DBgProps) {
  return <ThreeSectionBg theme={theme} className={className} />;
}

export { Section3DBg };
export type { Section3DBgProps };
export default Section3DBg;
