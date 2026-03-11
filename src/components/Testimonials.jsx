import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import './Testimonials.css';
import testimonial1 from '../assets/testimonial_1.png';
import testimonial2 from '../assets/testimonial_2.png';
import sergePortrait from '../assets/serge_portrait.png';

const testimonialsData = [
  {
    name: "ALEX RIVERA",
    role: "TECH ARCHITECT",
    location: "SAN FRANCISCO, CA",
    image: testimonial1,
    quote: "Serge is a tech enthusiast whose work involves programming and data analysis, turning unstructured, real problems into systems that operate reliably.",
    tag: "IMG_ID: 01"
  },
  {
    name: "SARAH CHEN",
    role: "PROJECT MANAGER",
    location: "LONDON, UK",
    image: testimonial2,
    quote: "Working with Serge was a game-changer. His ability to craft immersive digital experiences while maintaining clean, robust fullstack code is truly exceptional.",
    tag: "IMG_ID: 02"
  },
  {
    name: "DAVID OKORO",
    role: "PRODUCT DESIGNER",
    location: "LAGOS, NIGERIA",
    image: sergePortrait,
    quote: "Beyond the screen, Serge is a committed professional dedicated to protecting our environment. His passion for both tech and conservation is inspiring.",
    tag: "IMG_ID: 03"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const textRef = useRef(null);
  const infoRef = useRef(null);
  const imageRef = useRef(null);

  const nextTestimonial = () => {
    const nextIdx = (index + 1) % testimonialsData.length;
    animateChange(nextIdx, -20);
  };

  const prevTestimonial = () => {
    const nextIdx = (index - 1 + testimonialsData.length) % testimonialsData.length;
    animateChange(nextIdx, 20);
  };

  const animateChange = (nextIdx, yOffset) => {
    const tl = gsap.timeline();

    tl.to([textRef.current, infoRef.current, imageRef.current], {
      opacity: 0,
      y: yOffset,
      duration: 0.3,
      onComplete: () => {
        setIndex(nextIdx);
        gsap.fromTo([textRef.current, infoRef.current, imageRef.current], 
          { opacity: 0, y: -yOffset }, 
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    });
  };

  const current = testimonialsData[index];

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <h2 className="testimonials-title">TESTIMONIALS</h2>
      </div>
      <div className="testimonials-layout">
        <div className="testimonials-visual">
          <div className="image-container">
            <img src={current.image} alt={current.name} className="testimonials-image" ref={imageRef} />
            <div className="image-overlay">
              <div className="overlay-top-left"></div>
              <div className="overlay-bottom-right">
                <span className="overlay-tag">{current.tag}</span>
                <span className="overlay-tag">RES: 4K</span>
              </div>
              <div className="scanning-line"></div>
            </div>
          </div>
          
          <div className="testimonials-nav">
            <button onClick={prevTestimonial} className="nav-btn cursor-hover">← PREV</button>
            <div className="nav-progress">
              <div className="progress-bar" style={{ width: `${((index + 1) / testimonialsData.length) * 100}%` }}></div>
            </div>
            <button onClick={nextTestimonial} className="nav-btn cursor-hover">NEXT →</button>
          </div>
        </div>

        <div className="testimonials-info">
          <div className="quote-icon">“</div>
          <p className="testimonials-intro-text" ref={textRef}>
            {current.quote}
          </p>

          <footer className="testimonials-status" ref={infoRef}>
            <div className="status-item">
              <span className="status-label">IDENTITY</span>
              <span className="status-value">{current.name}</span>
            </div>
            <div className="status-item">
              <span className="status-label">ROLE</span>
              <span className="status-value highlight">{current.role}</span>
            </div>
            <div className="status-item">
              <span className="status-label">LOC</span>
              <span className="status-value">{current.location}</span>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
