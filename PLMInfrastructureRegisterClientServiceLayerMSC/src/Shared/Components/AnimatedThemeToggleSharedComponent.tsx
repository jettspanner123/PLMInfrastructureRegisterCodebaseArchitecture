import React, { useCallback, useEffect, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import ApplicationThemeCON from '../../Constants/ApplicationThemeCON';

export type TransitionVariant =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'rectangle'
  | 'star';

export interface AnimatedThemeToggleSharedComponentProps {
  currentTheme?: string;
  onToggleTheme?: () => void;
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
  className?: string;
}

function polygonCollapsed(point: string, vertexCount: number): string {
  const pairs = Array.from({ length: vertexCount }, () => point).join(', ');
  return `polygon(${pairs})`;
}

function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  switch (variant) {
    case 'circle':
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
    case 'square': {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const halfSide = Math.max(halfW, halfH) * 1.05;
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(', ');
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case 'triangle': {
      const scale = maxRadius * 2.2;
      const dx = (Math.sqrt(3) / 2) * scale;
      const verts = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(', ');
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`];
    }
    case 'diamond': {
      const R = maxRadius * Math.SQRT2;
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(', ');
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case 'hexagon': {
      const R = maxRadius * Math.SQRT2;
      const verts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)));
      }
      return [polygonCollapsed(point(cx, cy), 6), `polygon(${verts.join(', ')})`];
    }
    case 'rectangle': {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(', ');
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case 'star': {
      const R = maxRadius * Math.SQRT2 * 1.03;
      const innerRatio = 0.42;
      const starPolygon = (radius: number) => {
        const verts: string[] = [];
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          verts.push(
            point(cx + radius * Math.cos(outerA), cy + radius * Math.sin(outerA))
          );
          const innerA = outerA + Math.PI / 5;
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA)
            )
          );
        }
        return `polygon(${verts.join(', ')})`;
      };
      const startR = Math.max(2, R * 0.025);
      return [starPolygon(startR), starPolygon(R)];
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
  }
}

export default function AnimatedThemeToggleSharedComponent({
  currentTheme,
  onToggleTheme,
  duration = 450,
  variant = 'circle',
  fromCenter = false,
  className = '',
}: AnimatedThemeToggleSharedComponentProps): React.JSX.Element {
  const isDark = currentTheme === ApplicationThemeCON.DARK;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const activeAnimRef = useRef<Animation | null>(null);

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel();
    activeAnimRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnim();
      const root = document.documentElement;
      if (root.dataset.magicuiThemeVt !== 'active') return;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
    };
  }, [cancelAnim]);

  const handleToggle = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.magicuiThemeVt === 'active'
    ) {
      onToggleTheme?.();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x: number;
    let y: number;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const applyTheme = () => {
      onToggleTheme?.();
    };

    // Fallback if View Transitions API is not supported in the browser
    if (
      typeof document === 'undefined' ||
      !(document as any).startViewTransition
    ) {
      applyTheme();
      return;
    }

    const clipPath = getThemeTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    );

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0]);

    const cleanup = () => {
      clearTimeout(safetyTimer);
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      root.style.removeProperty('--magicui-theme-vt-clip-from');
      cancelAnim();
    };

    // Failsafe: if the View Transition never finishes (e.g. navigation mid-animation),
    // force cleanup so the page doesn't stay clipped to circle(0%).
    const safetyTimer = setTimeout(cleanup, duration + 200);

    isTransitioningRef.current = true;
    const transition = (document as any).startViewTransition(() => {
      flushSync(applyTheme);
    });

    if (transition?.finished?.finally) {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          const anim = document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration,
              easing: variant === 'star' ? 'linear' : 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            }
          );
          activeAnimRef.current = anim;
        })
        .catch(() => {});
    }
  }, [variant, fromCenter, duration, onToggleTheme, cancelAnim]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={handleToggle}
      aria-label="Toggle light and dark theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-all shadow-sm cursor-pointer flex items-center justify-center ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
      )}
    </button>
  );
}
