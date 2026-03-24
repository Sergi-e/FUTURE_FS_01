import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './Hero.css';
import portrait from '../assets/serge_portrait.png';

export default function Hero() {
  const container = useRef(null);
  const [resumeUrl, setResumeUrl] = useState('/Serge_Ishimwe_Resume.pdf');

  useEffect(() => {
    fetch('http://localhost:5000/api/settings/resume')
      .then(res => res.json())
      .then(data => {
        if (data && data.value) setResumeUrl(data.value);
      })
      .catch(err => console.error('Failed to fetch resume url', err));
      
    if (!container.current) return;
    let ctx = gsap.context((self) => {
      const otherElements = self.selector('.top-right-loc, .bottom-right-loc, .hero-portrait-wrap, .hero-subtitle, .hero-actions-minimal');
      
      // Reveal animation for non-title elements
      gsap.from(otherElements, {
        y: 40,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: 'power4.out',
        delay: 0.5
      });

      // Infinite letter-by-letter animation for main title without scroll effect
      const letters = self.selector('.title-word .char');
      gsap.fromTo(letters, 
        { y: 30, opacity: 0, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'back.out(1.5)', 
          delay: 0.2,
          repeat: -1,
          repeatDelay: 1.5,
          yoyo: true // Makes them disappear smoothly before restarting
        }
      );
      
      gsap.to('.hero-portrait-glow', {
        opacity: 0.6,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, container.current);

    return () => ctx.revert();
  }, []);

  const splitTextToSpans = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
        {char}
      </span>
    ));
  };

  return (
    <section className="hero" id="home" ref={container}>
      <div className="hero-grain-overlay"></div>
      <div className="hero-top-glow"></div>
      
      <div className="hero-info-bar">
        <a 
          href="https://maps.google.com/?q=Kigali,+Rwanda" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="info-location-link"
        >
          <span className="info-location top-right-loc">KIGALI, RWANDA</span>
        </a>
      </div>

      <div className="hero-bottom-info">
        <a 
          href="https://maps.google.com/?q=Accra,+Ghana" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="info-location-link"
        >
          <span className="info-location bottom-right-loc">ACCRA, GHANA</span>
        </a>
      </div>

      <div className="hero-content-centered">
        <div className="hero-portrait-wrap">
          <div className="hero-portrait-glow"></div>
          <img src={portrait} alt="Serge Ishimwe" className="hero-portrait-img" />
        </div>

        <div className="hero-main-title">
          <div className="title-row title-row-top">
            <span className="title-word">{splitTextToSpans("FULL")}</span>
            <span className="title-word title-hyphen">{splitTextToSpans("-")}</span>
            <span className="title-word">{splitTextToSpans("STACK")}</span>
          </div>
          <div className="title-row title-row-bottom">
            <span className="title-word accent-text">{splitTextToSpans("DEVELOPER")}</span>
          </div>
        </div>
        
        <p className="hero-subtitle">
          Hello. I'm Serge, a full-stack developer, and an Aspiring AI Engineer. I craft <strong>strategic, user-focused</strong> digital products that ensure reliable systems and <strong>measurable impact</strong>. <a href="#approach" className="hero-more-link">more</a>
        </p>

        <div className="hero-actions-minimal">
          <a 
            href={resumeUrl}
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
