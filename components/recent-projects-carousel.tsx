"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface RecentProject {
  title: string;
  description: string;
  image?: string;
  link: string;
  tags: string[];
}

interface RecentProjectsCarouselProps {
  projects: RecentProject[];
}

function ProjectImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-4xl font-bold text-muted-foreground/30">{alt.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"
      onError={() => setHasError(true)}
    />
  );
}

function getFullResImagePath(imagePath?: string): string | null {
  if (!imagePath) return null;
  // Convert "name.webp" to "name-full-res.webp"
  const parts = imagePath.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop();
  return `${parts.join(".")}-full-res.${ext}`;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  title: string;
}

function ImageModal({ isOpen, onClose, imageSrc, title }: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-background/40"
        aria-label="Close modal"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image container */}
      <div
        className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={`/assets/projects/${imageSrc}`}
          alt={title}
          width={1920}
          height={1200}
          className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
          priority
        />
      </div>
    </div>
  );
}

export function RecentProjectsCarousel({ projects }: RecentProjectsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(projects.length);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState("");

  // Calculate pages and track scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updatePagesAndPosition = () => {
      const containerWidth = container.clientWidth;
      const cardWidth = container.firstElementChild?.clientWidth || 300;
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
    setHasDragged(false);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.scrollBehavior = "auto";
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const container = scrollRef.current;
      if (!container) return;

      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        setHasDragged(true);
      }
      container.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

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

  const handleCardClick = useCallback(
    (project: RecentProject) => {
      if (hasDragged) return;
      const fullResImage = getFullResImagePath(project.image);
      if (fullResImage) {
        setModalImage(fullResImage);
        setModalTitle(project.title);
      }
    },
    [hasDragged]
  );

  const closeModal = useCallback(() => {
    setModalImage(null);
    setModalTitle("");
  }, []);

  const [prefetchedImages, setPrefetchedImages] = useState<Set<string>>(new Set());

  const prefetchImage = useCallback((imagePath?: string) => {
    const fullResImage = getFullResImagePath(imagePath);
    if (fullResImage && !prefetchedImages.has(fullResImage)) {
      setPrefetchedImages((prev) => new Set(prev).add(fullResImage));
    }
  }, [prefetchedImages]);

  const scrollToPage = (pageIndex: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = totalPages > 1 ? (pageIndex / (totalPages - 1)) * maxScroll : 0;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className={`recent-projects-carousel ${isDragging ? "is-dragging" : ""}`}
        role="list"
        aria-label="Recent projects"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {projects.map((project, index) => (
          <Card
            key={`${project.title}-${index}`}
            className="recent-project-card flex flex-col overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
            onClick={() => handleCardClick(project)}
            onMouseEnter={() => prefetchImage(project.image)}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
              <ProjectImage src={`/assets/projects/${project.image}`} alt={project.title} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="text-base font-semibold leading-tight">{project.title}</h3>
              <p className="flex-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              {project.tags.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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

      <ImageModal
        isOpen={!!modalImage}
        onClose={closeModal}
        imageSrc={modalImage}
        title={modalTitle}
      />

      {/* Hidden prefetch images */}
      <div className="hidden">
        {Array.from(prefetchedImages).map((img) => (
          <Image
            key={img}
            src={`/assets/projects/${img}`}
            alt=""
            width={1920}
            height={1200}
            priority
          />
        ))}
      </div>
    </div>
  );
}
