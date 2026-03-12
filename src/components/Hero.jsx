import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Hero.css';
import portrait from '../assets/serge_portrait.png';

export default function Hero() {
  const container = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal animation for all elements
      gsap.from('.hero-info-bar span, .hero-portrait-wrap, .hero-main-title h1, .hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1.5,
        stagger: 0.15,
        ease: 'power4.out',
        delay: 0.5
      });
      
      // Subtle pulse for the portrait glow
      gsap.to('.hero-portrait-glow', {
        opacity: 0.6,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="home" ref={container}>
      <div className="hero-grain-overlay"></div>
      <div className="hero-top-glow"></div>
      
      <div className="hero-info-bar">
        <span className="info-location top-right-loc">KIGALI, RWANDA</span>
      </div>

      <div className="hero-bottom-info">
        <span className="info-location bottom-left-loc">ACCRA, GHANA</span>
      </div>

      <div className="hero-content-centered">
        <div className="hero-portrait-wrap">
          <div className="hero-portrait-glow"></div>
          <img src={portrait} alt="Serge Ishimwe" className="hero-portrait-img" />
        </div>

        <div className="hero-main-title">
          <h1 className="hero-title-text">Full-stack</h1>
          <h1 className="hero-title-text accent-text">Developer</h1>
        </div>
        
        <p className="hero-subtitle">
          Crafting <strong>strategic, user-focused</strong> digital products that <br />
          ensure reliable systems and <strong>measurable impact</strong>.
        </p>

        <div className="hero-actions-minimal">
          <a 
            href="/Serge_Ishimwe_Resume.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="minimal-resume-link"
          >
            [ VIEW RESUME ]
          </a>
        </div>
      </div>
    </section>
  );
}
