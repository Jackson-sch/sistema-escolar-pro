"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  layoutId?: string;
  size?: "default" | "sm";
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  layoutId = "active-tab",
  size = "default",
}: AnimatedTabsProps) {
  return (
    <div className="w-full max-w-full overflow-x-auto scrollbar-hide py-1">
      <div
        className={cn(
          "flex flex-row items-center justify-start bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-full w-fit border border-white/10 min-w-max",
          className,
        )}
      >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-2",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              isActive
                ? "dark:text-white text-zinc-900"
                : "text-zinc-400 dark:hover:text-zinc-200 hover:text-zinc-900",
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-full"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
              >
                {/* 1. Main glassy pill base - Slightly more opaque */}
                <div className="absolute inset-0 rounded-full dark:bg-white/12 bg-zinc-900/12 ring-1 ring-white/20 shadow-lg" />

                {/* 2. Enhanced soft diffused bloom at the bottom */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2/3 dark:bg-white/15 bg-zinc-900/15 blur-xl rounded-full" />

                {/* 3. Inner glow - More noticeable */}
                <div className="absolute inset-0 rounded-full dark:bg-linear-to-b from-white/08 bg-linear-to-b from-zinc-900/12 to-transparent" />

                {/* 4. Center 'Hotspot' for depth */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/4 dark:bg-white/10 bg-zinc-900/10 blur-md rounded-full" />
              </motion.div>
            )}
            {tab.icon && <span className="relative z-10">{tab.icon}</span>}
            <span 
              className={cn(
                "relative z-10 transition-all duration-300 whitespace-nowrap",
                tab.icon && !isActive && "hidden sm:inline-block"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
