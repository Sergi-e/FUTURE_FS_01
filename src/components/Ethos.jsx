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
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1,
          },
        });

        tl.to('.ethos-text-mask', {
          backgroundPositionX: '0%',
          ease: 'none',
        });
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
        <h2 className="ethos-title">THE APPROACH</h2>
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
