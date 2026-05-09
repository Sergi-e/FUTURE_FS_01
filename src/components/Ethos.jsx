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
        /* Code card starts at 0.55 so it only appears after the text reveal is more than
           halfway done — the two elements never animate simultaneously at the same progress. */
        tl.fromTo(
          '.ethos-code-card',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.45 },
          0.55
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

        {/* Left: title + body */}
        <div className="ethos-left">
          <h2 className="ethos-title">My Approach</h2>
          <div className="ethos-text-container">
            <p className="ethos-text-mask">
              I take unstructured, real-world problems and work backwards from the outcome, combining
              software engineering and data thinking to build systems that hold up under pressure.
              Beyond the screen, I&apos;m a committed environmental conservationist dedicated to
              protecting water bodies and marine life.
            </p>
          </div>
        </div>

        {/* Right: code card */}
        <div className="ethos-code-card" aria-hidden="true">
          <div className="ethos-code-card__bar">
            <span className="ethos-code-card__dot ethos-code-card__dot--r" />
            <span className="ethos-code-card__dot ethos-code-card__dot--y" />
            <span className="ethos-code-card__dot ethos-code-card__dot--g" />
            <span className="ethos-code-card__filename">developer.js</span>
          </div>
          <div className="ethos-code-card__body">
            {[
              <>
                <span className="ec-keyword">const</span>
                <span className="ec-var"> developer </span>
                <span className="ec-punct">= {'{'}</span>
              </>,
              <>
                <span className="ec-indent-pad" />
                <span className="ec-key">name</span>
                <span className="ec-punct">: </span>
                <span className="ec-string">&quot;Serge Ishimwe&quot;</span>
                <span className="ec-punct">,</span>
              </>,
              <>
                <span className="ec-indent-pad" />
                <span className="ec-key">focus</span>
                <span className="ec-punct">: </span>
                <span className="ec-string">&quot;Fullstack + AI/ML&quot;</span>
                <span className="ec-punct">,</span>
              </>,
              <>
                <span className="ec-indent-pad" />
                <span className="ec-key">available</span>
                <span className="ec-punct">: </span>
                <span className="ec-bool">true</span>
                <span className="ec-punct">,</span>
              </>,
              <><span className="ec-punct">{'};'}</span></>,
            ].map((line, i) => (
              <div key={i} className="ec-line">
                <span className="ec-lineno">{i + 1}</span>
                <span className="ec-code">{line}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
