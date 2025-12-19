"use client";

import { useState } from "react";

type Tab = "articles" | "devlog";

interface WritingTabsProps {
  variant: "text" | "pill" | "segmented";
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function WritingTabs({ variant, activeTab, onTabChange }: WritingTabsProps) {
  if (variant === "text") {
    return (
      <div className="flex gap-6">
        <button
          onClick={() => onTabChange("articles")}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "articles"
              ? "border-accent text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Articles
        </button>
        <button
          onClick={() => onTabChange("devlog")}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "devlog"
              ? "border-accent text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Dev Log
        </button>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onTabChange("articles")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            activeTab === "articles"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Articles
        </button>
        <button
          onClick={() => onTabChange("devlog")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            activeTab === "devlog"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Dev Log
        </button>
      </div>
    );
  }

  // segmented
  return (
    <div className="inline-flex rounded-lg bg-secondary p-1">
      <button
        onClick={() => onTabChange("articles")}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          activeTab === "articles"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Articles
      </button>
      <button
        onClick={() => onTabChange("devlog")}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
          activeTab === "devlog"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Dev Log
      </button>
    </div>
  );
}

// Helper component that includes state management
interface WritingTabsWithStateProps {
  variant: "text" | "pill" | "segmented";
  defaultTab?: Tab;
  children: (activeTab: Tab) => React.ReactNode;
}

export function WritingTabsWithState({
  variant,
  defaultTab = "articles",
  children,
}: WritingTabsWithStateProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div>
      <WritingTabs variant={variant} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-8">{children(activeTab)}</div>
    </div>
  );
}
