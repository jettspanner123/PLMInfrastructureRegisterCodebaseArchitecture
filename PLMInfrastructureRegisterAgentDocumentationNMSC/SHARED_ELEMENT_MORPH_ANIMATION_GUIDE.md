# Guide: Shared-Element "Morph" Animations (Trigger → Centered Panel)

**Status**: Working, verified pattern. The user explicitly likes this animation style and wants it reused as the default for future UI that expands a small trigger into a larger view — see `ChatAssistantSharedComponent.tsx` for the canonical, currently-shipping example this guide documents.

## What this is

A small element (an icon button, a card, a thumbnail) visually **grows into** a larger element (a centered modal, a detail panel, a full preview) — the small thing doesn't fade out while a separate large thing fades in; one shape smoothly reshapes into the other, and reverses the same way on close. This reads as dramatically more polished than a plain fade/scale modal, which is why the user singled it out.

If you're building anything where a small trigger expands into a bigger view, reach for this pattern by default rather than a generic fade/scale/slide transition, unless told otherwise.

## The library

[Motion](https://motion.dev) (the npm package is literally named `motion`, imported as `motion/react` in this project — this is the rebranded, current version of what used to be called Framer Motion; don't confuse the two names, they're the same library). Installed version in this project: `motion: ^12.43.0` (check `package.json` before assuming an older/newer API if this ever feels stale).

## The naive approach — and exactly where it breaks

Motion's own official recipe for this ("shared element transition") is: give two different elements the same `layoutId` prop. Only one is ever mounted at a time (toggled by state, each wrapped so it mounts/unmounts). When one unmounts and the other mounts, Motion is *supposed to* automatically measure the outgoing element's last screen position and animate the incoming element from that position to its own natural layout — a "FLIP" (First-Last-Invert-Play) technique, fully automatic, no manual measurement needed.

**This works great in the simple case** (both elements in the same normal DOM tree, not portaled). **It silently breaks once the destination element needs to be portaled** (`createPortal`, e.g. to `document.body`) — which it almost always will, if it needs to be a centered, backdrop-blurred, full-viewport overlay. This is not a theoretical concern: it's a confirmed, documented class of bug — **framer/motion GitHub issue #1524**, *"Shared layout animations not working when rendered in React portal."*

### Why you need the portal in the first place

A centered, full-viewport modal needs `position: fixed`. But `position: fixed` is relative to the nearest ancestor that establishes a new **containing block** — and several common CSS properties create one, including `transform`, `filter`, and **`backdrop-filter`**. If any ancestor between your trigger and `<body>` has one of these (e.g. a sticky header with `backdrop-blur-md`, which this project's own `NavigationController.tsx` header has), your "full-viewport" modal silently gets trapped inside that ancestor's box instead of covering the real viewport. Portaling straight to `document.body` sidesteps this entirely. **Don't skip the portal to "simplify" this pattern** — you'll just trade one bug for a worse one.

## Three fixes that do NOT work (tried and empirically disproven, not guessed)

If you hit "closing morphs beautifully, opening just pops to full size instantly," do **not** waste time retrying these — they were each tried and measured (see "How to verify" below) on this exact project:

1. **Giving the collapsed trigger its own `exit` + matching `transition` prop**, on the theory that `AnimatePresence` needs to hold it in a tracked exit phase for Motion to capture its rect. Tested. No change — the panel still popped to full size instantly on open.
2. **Wrapping both the trigger and the portaled panel in a shared `<LayoutGroup>`**, on the theory that `layoutId` needs explicit grouping to bridge two separate `AnimatePresence` instances in two different subtrees. Tested. No change.
3. **Restructuring so both states are branches of one ternary inside a single shared `<AnimatePresence>`** (matching Motion's own canonical recipe structure exactly). This is the fix Motion's docs most directly imply you need. Tested — and it didn't just fail to animate, **it rendered nothing at all**. `AnimatePresence` does not appear to correctly track a `createPortal(...)` call's return value as a trackable conditional child, even though that return value is a perfectly valid React node anywhere else.

The honest conclusion: automatic `layoutId` bridging across a portal boundary, specifically for the *fresh-mount* direction (one element appearing for the first time, with no prior existence of its own to measure from), is unreliable in current Motion. The *retarget* direction (an element that's already mounted and continuously being measured throughout its own tracked exit, just re-aiming toward a new target) works fine automatically — that asymmetry is exactly why "closing works, opening doesn't" is the symptom you'll see if you try the naive approach.

## The fix that actually works: a manual flip

Don't rely on automatic `layoutId` projection for the fresh-mount (opening) direction. Measure the trigger's real screen position yourself, and imperatively animate the panel's transform from that measured position to neutral, using Motion's `useAnimate` hook. Keep `layoutId` on both elements anyway (harmless — it still drives the *closing* direction automatically, which works perfectly without any extra help) and layer the manual flip on top for opening only.

### The recipe, step by step

```tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimate } from 'motion/react';

interface SimpleRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SHARED_LAYOUT_ID = 'your-unique-id-here';
const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 300, damping: 30 };

export default function YourMorphingComponent(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRectRef = useRef<SimpleRect | null>(null);
  const [panelScope, animatePanel] = useAnimate();

  // 1. Cache the trigger's real screen position. If its position in the
  //    page is stable while closed (e.g. a fixed toolbar slot), you only
  //    need to re-measure on resize, not on every open.
  useEffect(() => {
    const measure = (): void => {
      if (!triggerButtonRef.current) return;
      const rect = triggerButtonRef.current.getBoundingClientRect();
      triggerRectRef.current = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 2. The manual flip itself. useLayoutEffect (NOT useEffect) is load-
  //    bearing here — it runs synchronously after the DOM commits but
  //    BEFORE the browser paints, so the panel's transform is seeded
  //    before the user ever sees a frame at full size.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const panelEl = panelScope.current;
    const origin = triggerRectRef.current;
    if (!panelEl || !origin) return;

    const finalRect = panelEl.getBoundingClientRect();
    const scaleX = origin.width / finalRect.width;
    const scaleY = origin.height / finalRect.height;
    const originCenterX = origin.x + origin.width / 2;
    const originCenterY = origin.y + origin.height / 2;
    const finalCenterX = finalRect.x + finalRect.width / 2;
    const finalCenterY = finalRect.y + finalRect.height / 2;

    animatePanel(
      panelEl,
      {
        // Keyframe arrays [from, to] - "from" is the computed offset that
        // visually places/sizes the panel exactly where the trigger was;
        // "to" is neutral (the panel's own natural position/size).
        x: [originCenterX - finalCenterX, 0],
        y: [originCenterY - finalCenterY, 0],
        scaleX: [scaleX, 1],
        scaleY: [scaleY, 1],
      },
      SPRING_TRANSITION
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
    setTimeout(() => triggerButtonRef.current?.focus(), 0); // focus-return convention
  };

  return (
    <React.Fragment>
      {/* 3. The trigger — its own AnimatePresence, mode="popLayout" so
             SIBLINGS (e.g. a neighboring toolbar button) reflow instantly
             when this unmounts, instead of visibly jumping after a
             reserved-space delay. */}
      <AnimatePresence mode="popLayout">
        {!isOpen && (
          <motion.button
            key="trigger"
            ref={triggerButtonRef}
            layoutId={SHARED_LAYOUT_ID}
            exit={{ opacity: 0 }}
            transition={SPRING_TRANSITION}
            onClick={() => setIsOpen(true)}
          >
            {/* icon */}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. The panel — portaled, its OWN separate AnimatePresence. This
             drives the CLOSING direction automatically via layoutId (works
             great on its own); the manual flip above only ever runs for
             OPENING. */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <React.Fragment>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={handleClose}
                className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  key="panel"
                  ref={panelScope}
                  layoutId={SHARED_LAYOUT_ID}
                  layoutRoot // see "layoutRoot" section below — required
                  transition={SPRING_TRANSITION}
                  className="pointer-events-auto w-full max-w-lg ..."
                >
                  {/* panel content */}
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
    </React.Fragment>
  );
}
```

### Why each load-bearing detail is there

- **`layoutRoot` on the panel**: required whenever the layoutId'd element lives inside a `position: fixed` context that's been portaled. Without it, Motion's projection math gets confused by the page's scroll offset and the (closing-direction) morph jitters instead of landing cleanly. This is a real, if lesser-known, documented prop — confirm it's supported by checking the installed `motion` version if anything here ever seems to silently not apply.
- **`mode="popLayout"` on the trigger's `AnimatePresence`**: without it (the default is `mode="sync"`), the trigger's old layout space stays reserved until its exit animation finishes, so a sibling element (e.g. a neighboring button) visibly snaps sideways a beat late instead of reflowing immediately.
- **`useLayoutEffect`, not `useEffect`, for the manual flip**: `useEffect` runs *after* the browser paints, so there'd be one visible frame at full size before the transform snaps in — small, but perceptible, and avoidable for free.
- **Two separate `AnimatePresence` instances (trigger's, panel's), not one shared one**: this is the one structural choice that looks "wrong" relative to Motion's own canonical single-`AnimatePresence` recipe — but recall attempt #3 above: forcing them into one shared instance, with the panel behind a portal, broke rendering entirely. Two instances is what actually ships correctly.

## How to verify this is actually working (don't just eyeball it)

Framer Motion animations can *look* plausible while still being broken (e.g. a CSS opacity fade can visually resemble "something animated" even when the actual size/position morph silently failed). Verify with a real rect-trajectory measurement, not a screenshot alone:

```js
// Run in the browser console, or via an automation tool's script-evaluation
// capability, right after triggering the open/close:
const samples = [];
const start = performance.now();
while (performance.now() - start < 500) {
  const el = document.querySelector('[role="dialog"]'); // or your panel's selector
  const r = el?.getBoundingClientRect();
  samples.push({ t: Math.round(performance.now() - start), w: r ? Math.round(r.width) : null });
  await new Promise((resolve) => requestAnimationFrame(resolve));
}
console.log(samples);
```

A working morph shows `w` climbing smoothly across ~25-30 samples (e.g. 47 → 78 → 174 → 366 → 492 → 513, settling). A broken one shows `w` jump straight to its final value in the very first sample. This exact technique is what caught all three failed attempts above *before* they were wrongly believed to work, and confirmed the manual flip actually does.

## Reusing this for something other than a chat button

The recipe generalizes directly — swap in whatever your own trigger/panel look like:

- The `SHARED_LAYOUT_ID` just needs to be unique per instance of this pattern on the page at once.
- `triggerButtonRef` can be any element you're measuring from (a card, a thumbnail, not necessarily a `<button>`).
- The spring values (`stiffness: 300, damping: 30`) are a good general-purpose default — snappy but not overshoot-y. Adjust to taste, but keep the SAME transition object for both the trigger's `exit` and the panel's `transition`/manual-flip call, so both directions stay symmetric.
- If the panel's final size is known ahead of time (not responsive), you can skip measuring `finalRect` and hardcode the scale math — but measuring is more robust and barely more code.

## Reference implementation in this codebase

`PLMInfrastructureRegisterClientServiceLayerMSC/src/Shared/Components/ChatAssistantSharedComponent.tsx` — the real, currently-shipping component this guide was extracted from. Read it directly for the full, exact, working code (including the chat-specific UI content this guide omits for brevity).
