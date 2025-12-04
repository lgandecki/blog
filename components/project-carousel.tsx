"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Project {
  title: string;
  description: string;
  downloads: string;
  type: string;
  link: string;
  tags: string[];
}

interface ProjectCarouselProps {
  projects: Project[];
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(projects.length);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate pages and track scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updatePagesAndPosition = () => {
      const containerWidth = container.clientWidth;
      const cardWidth = container.firstElementChild?.clientWidth || 280;
      const gap = 16;

      // How many full cards fit in the container
      const visibleCards = Math.floor((containerWidth + gap) / (cardWidth + gap));
      // Number of scroll positions (pages)
      const pages = Math.max(1, projects.length - visibleCards + 1);
      setTotalPages(pages);

      // Calculate current page based on scroll position
      const maxScroll = container.scrollWidth - containerWidth;
      const currentScroll = container.scrollLeft;

      if (maxScroll <= 0) {
        setActiveIndex(0);
      } else {
        const scrollRatio = currentScroll / maxScroll;
        const pageIndex = Math.round(scrollRatio * (pages - 1));
        setActiveIndex(Math.min(pageIndex, pages - 1));
      }
    };

    updatePagesAndPosition();

    container.addEventListener("scroll", updatePagesAndPosition, { passive: true });
    window.addEventListener("resize", updatePagesAndPosition);

    return () => {
      container.removeEventListener("scroll", updatePagesAndPosition);
      window.removeEventListener("resize", updatePagesAndPosition);
    };
  }, [projects.length]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.scrollBehavior = "auto";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiply for faster scroll
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const container = scrollRef.current;
    if (container) {
      container.style.scrollBehavior = "smooth";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollRef.current;
      if (container) {
        container.style.scrollBehavior = "smooth";
      }
    }
  }, [isDragging]);

  const scrollToPage = (pageIndex: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = totalPages > 1
      ? (pageIndex / (totalPages - 1)) * maxScroll
      : 0;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className={`project-carousel ${isDragging ? "is-dragging" : ""}`}
        role="list"
        aria-label="Open source projects"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {projects.map((project, index) => (
          <Card
            key={`${project.title}-${index}`}
            className="project-carousel-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className="rounded bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {project.type}
              </span>
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} on ${project.type}`}
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
            <h3 className="text-base font-semibold leading-tight">
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {project.title}
              </Link>
            </h3>
            <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            <p className="text-xs text-muted-foreground">{project.downloads}</p>
            <div className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="carousel-dots">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => scrollToPage(index)}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
