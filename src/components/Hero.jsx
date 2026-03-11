import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Hero.css';

export default function Hero() {
  const container = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.hero-title-line', {
        y: 100,
        opacity: 0,
        duration: 2,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.2
      });
      
      gsap.to('.hero-accent', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'linear'
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={container}>
      <div className="hero-content">
        <div className="title-overflow">
          <h1 className="hero-title-line">SERGE</h1>
        </div>
        <div className="title-overflow">
          <h1 className="hero-title-line">ISHIMWE</h1>
        </div>
        <div className="title-overflow">
          <h1 className="hero-title-line">FULL-STACK <span className="hero-accent">✦</span></h1>
        </div>
        
        <p className="hero-subtitle">
          Fullstack Developer & Aspiring AI Engineer crafting reliable systems and immersive digital experiences.
        </p>

        <div className="hero-actions">
          <a 
            href="/Serge_Ishimwe_Resume.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="resume-button cursor-hover"
          >
            VIEW RESUME
          </a>
        </div>
      </div>
    </section>
  );
}
