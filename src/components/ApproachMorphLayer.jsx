import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import approachBadge from '../assets/approach-badge.svg';
import './ApproachMorphLayer.css';

gsap.registerPlugin(ScrollTrigger);

function readSlotRect(slot) {
  const r = slot.getBoundingClientRect();
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  };
}

function readApproachSectionRect() {
  const el = document.querySelector('#approach');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  };
}

function smoothstep(p) {
  const t = gsap.utils.clamp(0, 1, p);
  return t * t * (3 - 2 * t);
}

/* Hero badge visible only while the layer is still “chip-sized” — never scale SVG to full section */
const REVEAL_PROGRESS = 0.22;
const BADGE_HIDE_MOVE_T = 0.44;
const MORPH_FADE_START = 0.68;
const MORPH_FADE_END = 0.88;

export default function ApproachMorphLayer({ slotRef }) {
  const layerRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(min-width: 769px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useLayoutEffect(() => {
    setMountNode(document.body);
  }, []);

  useLayoutEffect(() => {
    const mqNarrow = window.matchMedia('(max-width: 768px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const on = !mqNarrow.matches && !mqReduce.matches;
      setEnabled(on);
      if (!on) {
        document.documentElement.classList.remove('approach-morph-active');
        document.documentElement.classList.remove('approach-morph-revealing');
      }
    };
    sync();
    mqNarrow.addEventListener('change', sync);
    mqReduce.addEventListener('change', sync);
    return () => {
      mqNarrow.removeEventListener('change', sync);
      mqReduce.removeEventListener('change', sync);
    };
  }, []);

  useLayoutEffect(() => {
    if (!mountNode || !enabled) {
      document.documentElement.classList.remove('approach-morph-active');
      document.documentElement.classList.remove('approach-morph-revealing');
      return undefined;
    }

    const layer = layerRef.current;
    const slot = slotRef?.current;
    if (!layer || !slot) return undefined;

    document.documentElement.classList.add('approach-morph-active');

    let from = readSlotRect(slot);
    const captureFrom = () => {
      const s = slotRef?.current;
      if (s) from = readSlotRect(s);
    };

    const applyFrame = (rawProgress) => {
      const progress = gsap.utils.clamp(0, 1, rawProgress);
      const moveT = smoothstep(progress);

      let morphOpacity = 1;
      if (progress >= MORPH_FADE_START) {
        morphOpacity =
          1 - smoothstep((progress - MORPH_FADE_START) / (MORPH_FADE_END - MORPH_FADE_START));
      }

      const useTransparentEthos =
        progress >= REVEAL_PROGRESS && morphOpacity > 0.18;
      if (useTransparentEthos) {
        document.documentElement.classList.add('approach-morph-revealing');
      } else {
        document.documentElement.classList.remove('approach-morph-revealing');
      }

      const sectionBox = readApproachSectionRect();
      const to =
        sectionBox ??
        (() => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          return { left: 0, top: 0, width: w, height: h };
        })();

      const left = gsap.utils.interpolate(from.left, to.left, moveT);
      const top = gsap.utils.interpolate(from.top, to.top, moveT);
      const width = gsap.utils.interpolate(from.width, to.width, moveT);
      const height = gsap.utils.interpolate(from.height, to.height, moveT);

      const rStart = Math.min(from.width, from.height) / 2;
      const rEnd = moveT > 0.9 ? 0 : Math.min(18, Math.min(width, height) * 0.035);
      const borderRadius = gsap.utils.interpolate(rStart, rEnd, moveT);

      const showBadge = moveT < BADGE_HIDE_MOVE_T && morphOpacity > 0.35;
      layer.dataset.badge = showBadge ? '1' : '0';
      layer.dataset.panel = showBadge ? '0' : '1';

      gsap.set(layer, {
        left,
        top,
        width,
        height,
        borderRadius,
        opacity: morphOpacity,
        boxShadow:
          moveT > 0.88 || !showBadge
            ? '0 0 0 1px rgba(204, 255, 0, 0.06)'
            : '0 0 0 1px rgba(204, 255, 0, 0.14), 0 28px 90px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      });
    };

    captureFrom();
    applyFrame(0);

    const homeSt = ScrollTrigger.create({
      trigger: '#home',
      start: 'top top',
      endTrigger: '#approach',
      end: 'top top',
      scrub: 0.42,
      invalidateOnRefresh: true,
      onRefresh(self) {
        captureFrom();
        applyFrame(self.progress);
      },
      onUpdate(self) {
        applyFrame(self.progress);
      },
    });

    const approachWatcher = ScrollTrigger.create({
      trigger: '#approach',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate() {
        if (homeSt.progress >= 0.97) {
          applyFrame(homeSt.progress);
        }
      },
    });

    const onResize = () => {
      captureFrom();
      applyFrame(homeSt.progress);
    };
    window.addEventListener('resize', onResize);

    requestAnimationFrame(() => {
      captureFrom();
      ScrollTrigger.refresh();
      applyFrame(homeSt.progress);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      approachWatcher.kill();
      homeSt.kill();
      document.documentElement.classList.remove('approach-morph-active');
      document.documentElement.classList.remove('approach-morph-revealing');
    };
  }, [mountNode, enabled, slotRef]);

  if (!mountNode || !enabled) return null;

  return createPortal(
    <div ref={layerRef} className="approach-morph-layer" aria-hidden="true">
      <img
        className="approach-morph-layer__badge"
        src={approachBadge}
        alt=""
        draggable={false}
      />
    </div>,
    mountNode
  );
}
