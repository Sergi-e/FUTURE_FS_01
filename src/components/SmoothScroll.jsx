import { useLayoutEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  useLayoutEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const scroller = document.documentElement;

    // Drop any stale viewport proxy (e.g. React StrictMode). Passing `{}` is truthy and would
    // register a broken proxy — use the one-arg form to remove only.
    ScrollTrigger.scrollerProxy(scroller);

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      scrollHeight: () => scroller.scrollHeight,
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "fixed",
    });

    /* Lenis drives scroll on <html>; ScrollTriggers must use this scroller or progress stays wrong (e.g. hero → Approach morph). */
    ScrollTrigger.defaults({ scroller });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    // Re-calculate scroll positions whenever dynamic content (e.g. API-loaded
    // projects / testimonials) changes the page height.
    let refreshTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 120);
    });
    ro.observe(document.body);

    return () => {
      clearTimeout(refreshTimer);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.scrollerProxy(scroller);
      ScrollTrigger.refresh();
    };
  }, []);

  return <>{children}</>;
}
