import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Testimonials.css';
import portraitImg from '../assets/serge_portrait.png';

const introWords = [
  "I am a tech enthusiast whose work involves programming and data analysis, turning unstructured, real problems into systems that operate reliably.",
  "Fullstack Developer & Aspiring AI Engineer crafting reliable systems and immersive digital experiences.",
  "Beyond the screen, I am a committed environmental conservationist, dedicated to protecting our water bodies and marine life."
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const textRef = useRef(null);
  const container = useRef(null);

  const nextWord = () => {
    gsap.to(textRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setIndex((prev) => (prev + 1) % introWords.length);
        gsap.fromTo(textRef.current, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    });
  };

  const prevWord = () => {
    gsap.to(textRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setIndex((prev) => (prev - 1 + introWords.length) % introWords.length);
        gsap.fromTo(textRef.current, 
          { opacity: 0, y: -20 }, 
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    });
  };

  return (
    <section className="testimonials" ref={container}>
      <div className="testimonials-layout">
        <div className="testimonials-visual">
          <div className="image-container">
            <img src={portraitImg} alt="Serge Ishimwe" className="testimonials-image" />
            <div className="image-overlay">
              <div className="overlay-top-left"></div>
              <div className="overlay-bottom-right">
                <span className="overlay-tag">IMG_ID: 01</span>
                <span className="overlay-tag">RES: 4K</span>
              </div>
              <div className="scanning-line"></div>
            </div>
          </div>
          
          <div className="testimonials-nav">
            <button onClick={prevWord} className="nav-btn">← PREV</button>
            <div className="nav-progress">
              <div className="progress-bar" style={{ width: `${((index + 1) / introWords.length) * 100}%` }}></div>
            </div>
            <button onClick={nextWord} className="nav-btn">NEXT →</button>
          </div>
        </div>

        <div className="testimonials-info">
          <div className="quote-icon">“</div>
          <p className="testimonials-intro-text" ref={textRef}>
            {introWords[index]}
          </p>

          <footer className="testimonials-status">
            <div className="status-item">
              <span className="status-label">IDENTITY</span>
              <span className="status-value">SERGE ISHIMWE</span>
            </div>
            <div className="status-item">
              <span className="status-label">ROLE</span>
              <span className="status-value highlight">FULLSTACK DEVELOPER</span>
            </div>
            <div className="status-item">
              <span className="status-label">LOC</span>
              <span className="status-value">KIGALI, RWANDA</span>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
