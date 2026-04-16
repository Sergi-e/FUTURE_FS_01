import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Ethos.css';

gsap.registerPlugin(ScrollTrigger);

export default function Ethos() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    let ctx;

    const setup = () => {
      if (ctx) {
        ctx.revert();
        ctx = undefined;
      }
      if (mq.matches) {
        ScrollTrigger.refresh();
        return;
      }
      ctx = gsap.context(() => {
        /* Pin first: section holds still while you scroll; brightening runs only in that pinned range. */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            /* Progress tracks scroll 1:1 so scrolling up reverses the pinned reveal. */
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          '.ethos-text-mask',
          { backgroundPositionX: '100%' },
          { backgroundPositionX: '0%', ease: 'none' },
          0
        );
      }, sectionRef);
      ScrollTrigger.refresh();
    };

    setup();
    mq.addEventListener('change', setup);
    return () => {
      mq.removeEventListener('change', setup);
      ctx?.revert();
    };
  }, []);

  return (
    <section className="ethos" id="approach" ref={sectionRef}>
      <div className="ethos-content" ref={textRef}>
        <h2 className="ethos-title">Approach</h2>
        <div className="ethos-text-container">
          <p className="ethos-text-mask">
            I take unstructured, real-world problems and work backwards from the outcome, combining
            software engineering and data thinking to build systems that hold up under pressure.
            Beyond the screen, I&apos;m a committed environmental conservationist dedicated to
            protecting water bodies and marine life.
          </p>
        </div>
      </div>
    </section>
  );
}
