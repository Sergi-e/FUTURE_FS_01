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
            scrub: 1,
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
        <h2 className="ethos-title">MY APPROACH</h2>
        <div className="ethos-text-container">
          <p className="ethos-text-mask">
            I am a tech enthusiast whose work involves programming and data analysis,
            turning unstructured, real problems into systems that operate reliably.
          </p>
        </div>

        <div className="ethos-sub">
          <p className="ethos-sub-text">
            Beyond the screen, I am a committed environmental conservationist,
            dedicated to protecting our water bodies and marine life.
          </p>
        </div>
      </div>
    </section>
  );
}
