import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Testimonials.css';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const infoRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/testimonials`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTestimonials(data);
      })
      .catch((err) => console.error('Failed to fetch testimonials', err));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = titleRef.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    const nextIdx = (index + 1) % testimonials.length;
    animateChange(nextIdx, -20);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    const nextIdx = (index - 1 + testimonials.length) % testimonials.length;
    animateChange(nextIdx, 20);
  };

  const animateChange = (nextIdx, yOffset) => {
    if (testimonials.length === 0) return;
    const tl = gsap.timeline();

    tl.to([textRef.current, infoRef.current, imageRef.current], {
      opacity: 0,
      y: yOffset,
      duration: 0.3,
      onComplete: () => {
        setIndex(nextIdx);
        gsap.fromTo([textRef.current, infoRef.current, imageRef.current],
          { opacity: 0, y: -yOffset },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    });
  };

  const current = testimonials[index];

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <h2 ref={titleRef} className="testimonials-title">TESTIMONIALS</h2>
      </div>
      {testimonials.length > 0 && current && (
        <div className="testimonials-layout">
          <div className="testimonials-visual">
            <div className="image-container">
              <img src={resolveMediaUrl(current.image)} alt={current.name} className="testimonials-image" ref={imageRef} />
            </div>

            <div className="testimonials-nav">
              <button type="button" onClick={prevTestimonial} className="nav-btn cursor-hover">← PREV</button>
              <div className="nav-progress">
                <div className="progress-bar" style={{ width: `${((index + 1) / testimonials.length) * 100}%` }}></div>
              </div>
              <button type="button" onClick={nextTestimonial} className="nav-btn cursor-hover">NEXT →</button>
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
      )}
    </section>
  );
}
