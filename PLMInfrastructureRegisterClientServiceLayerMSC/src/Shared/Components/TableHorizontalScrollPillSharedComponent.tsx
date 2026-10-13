import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import ApplicationHorizontalScrollPillUtility from '../../Utilities/ApplicationHorizontalScrollPillUtility';

export interface TableHorizontalScrollPillSharedComponentProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function TableHorizontalScrollPillSharedComponent({
  scrollContainerRef,
}: TableHorizontalScrollPillSharedComponentProps): React.JSX.Element | null {
  const pillRef = useRef<HTMLDivElement | null>(null);

  const [isEnabled, setIsEnabled] = useState<boolean>(() =>
    ApplicationHorizontalScrollPillUtility.current.isEnabled()
  );
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [canScroll, setCanScroll] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ clientX: number; startScrollLeft: number } | null>(null);

  // Sync preference toggle
  useEffect(() => {
    const handlePreferenceChange = (): void => {
      setIsEnabled(ApplicationHorizontalScrollPillUtility.current.isEnabled());
    };

    window.addEventListener(
      ApplicationHorizontalScrollPillUtility.PREFERENCE_CHANGED_EVENT,
      handlePreferenceChange
    );
    return () => {
      window.removeEventListener(
        ApplicationHorizontalScrollPillUtility.PREFERENCE_CHANGED_EVENT,
        handlePreferenceChange
      );
    };
  }, []);

  // Update metrics based on current scroll position & overflow
  const updateMetrics = useCallback((): void => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCanScroll(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    if (maxScroll <= 2) {
      setCanScroll(false);
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScroll(true);
    setScrollProgress(Math.max(0, Math.min(1, scrollLeft / maxScroll)));
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  }, [scrollContainerRef]);

  // Listen to container scroll and window/element resizes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateMetrics();

    container.addEventListener('scroll', updateMetrics, { passive: true });
    window.addEventListener('resize', updateMetrics);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(container);
      if (container.firstElementChild) {
        resizeObserver.observe(container.firstElementChild);
      }
    }

    return () => {
      container.removeEventListener('scroll', updateMetrics);
      window.removeEventListener('resize', updateMetrics);
      resizeObserver?.disconnect();
    };
  }, [scrollContainerRef, updateMetrics]);

  // Handle stepping by column chunk (~200px)
  const handleStepLeft = (event: React.MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleStepRight = (event: React.MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Drag interaction
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    const container = scrollContainerRef.current;
    if (!container || !canScroll) return;

    // Only main mouse button or touch/pen
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    dragStartRef.current = {
      clientX: event.clientX,
      startScrollLeft: container.scrollLeft,
    };
    setIsDragging(true);

    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // Ignore if pointer capture unavailable
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging || !dragStartRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    event.preventDefault();
    event.stopPropagation();

    const maxScroll = Math.max(1, container.scrollWidth - container.clientWidth);
    const pillWidth = pillRef.current?.offsetWidth || 116;
    const padding = 16;
    const travelWidth = Math.max(1, window.innerWidth - pillWidth - padding * 2);

    const deltaX = event.clientX - dragStartRef.current.clientX;
    const scrollDelta = deltaX * (maxScroll / travelWidth);
    const targetScrollLeft = dragStartRef.current.startScrollLeft + scrollDelta;

    container.scrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    event.preventDefault();
    event.stopPropagation();
    dragStartRef.current = null;
    setIsDragging(false);

    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // Ignore
    }
  };

  if (!isEnabled || !canScroll) {
    return null;
  }

  // Calculate sliding position along bottom edge of viewport
  const pillWidth = pillRef.current?.offsetWidth || 116;
  const padding = 16;
  const travelWidth = Math.max(0, (typeof window !== 'undefined' ? window.innerWidth : 1200) - pillWidth - padding * 2);
  const leftPosition = padding + scrollProgress * travelWidth;

  return (
    <div
      ref={pillRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${leftPosition}px`,
        touchAction: 'none',
      }}
      aria-label="Table horizontal scroll controller"
      title="Hold and drag to scroll table horizontally"
      className={`fixed bottom-4 z-40 h-8 px-1.5 rounded-full flex items-center gap-1 select-none bg-[#0c2086] border border-[#1e3ab8]/70 dark:border-white/15 shadow-lg shadow-[#0c2086]/30 dark:shadow-black/50 transition-transform duration-150 ${
        isDragging ? 'cursor-grabbing scale-105 ring-2 ring-white/40' : 'cursor-grab hover:scale-102'
      }`}
    >
      <button
        type="button"
        onClick={handleStepLeft}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!canScrollLeft}
        aria-label="Scroll left by 200px"
        title="Scroll left"
        className="w-6 h-6 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:bg-white/25 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-white" />
      </button>

      <div className="flex items-center justify-center px-1 py-1 text-white/80">
        <GripVertical className="w-3.5 h-3.5 text-white/80" />
      </div>

      <button
        type="button"
        onClick={handleStepRight}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!canScrollRight}
        aria-label="Scroll right by 200px"
        title="Scroll right"
        className="w-6 h-6 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:bg-white/25 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronRight className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
}
