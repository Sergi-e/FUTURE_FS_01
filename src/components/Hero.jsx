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
    <section className="hero" id="home" ref={container}>
      <div className="hero-background">
        <div className="gradient-sphere"></div>
        <div className="scanning-line"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-top">
          <span className="hero-tag">[ AVAILABLE FOR FREELANCE ]</span>
        </div>

        <div className="hero-main-title">
          <div className="title-overflow">
            <h1 className="hero-title-line">SERGE</h1>
          </div>
          <div className="title-overflow">
            <h1 className="hero-title-line">ISHIMWE</h1>
          </div>
          <div className="title-overflow">
            <h1 className="hero-title-line primary-gradient">FULL-STACK <span className="hero-accent">✦</span></h1>
          </div>
        </div>
        
        <div className="hero-bottom">
          <p className="hero-subtitle">
            Developer & Aspiring AI Engineer crafting <br />
            reliable systems and immersive digital experiences.
          </p>

          <div className="hero-actions">
            <a 
              href="/Serge_Ishimwe_Resume.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="resume-button cursor-hover"
            >
              <span>VIEW RESUME</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.64645 11.3536C3.45118 11.5488 3.45118 11.8654 3.64645 12.0607C3.84171 12.2559 4.15829 12.2559 4.35355 12.0607L3.64645 11.3536ZM11.5 4C11.5 3.72386 11.2761 3.5 11 3.5L6.5 3.5C6.22386 3.5 6 3.72386 6 4C6 4.27614 6.22386 4.5 6.5 4.5L10.5 4.5L10.5 8.5C10.5 8.77614 10.7239 9 11 9C11.2761 9 11.5 8.77614 11.5 8.5L11.5 4ZM4.35355 12.0607L11.3536 5.06066L10.6464 4.35355L3.64645 11.3536L4.35355 12.0607Z" fill="currentColor"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
