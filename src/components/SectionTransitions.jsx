import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SectionTransitions({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('section');
      
      sections.forEach((section, i) => {
        // Higher z-index for newer sections so they appear "over" the old ones
        gsap.set(section, { zIndex: i });

        if (i > 0) {
          // All sections after the first start hidden
          gsap.set(section, { clipPath: 'circle(0% at 50% 50%)' });

          // Rise and Reveal animation
          gsap.to(section, {
            clipPath: 'circle(150% at 50% 50%)',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=100%", // Reveal over 100% of viewport height
              scrub: 1,
              pin: sections[i-1], // Pin the PREVIOUS section while this one reveals
              pinSpacing: false
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="sections-wrapper" ref={containerRef} style={{ position: 'relative' }}>
      {children}
    </div>
  );
}
