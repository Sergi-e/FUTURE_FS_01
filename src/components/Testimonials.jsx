import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import { getJson } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Testimonials.css';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const textRef = useRef(null);
  const infoRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getJson('/testimonials')
      .then((data) => {
        if (cancelled) return;
        if (data && data.length > 0) {
          setTestimonials(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch testimonials', `${API_BASE_URL}/testimonials`, err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [testimonials.length]);
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
        gsap.fromTo(
          [textRef.current, infoRef.current, imageRef.current],
          { opacity: 0, y: -yOffset },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    });
  };

  if (testimonials.length === 0) {
    return (
      <section className="testimonials" id="testimonials">
        <div className="testimonials-header">
          <h2 className="testimonials-title">TESTIMONIALS</h2>
        </div>
      </section>
    );
  }

  const current = testimonials[index];
  const imageSrc = resolveMediaUrl(current.image);

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <h2 className="testimonials-title">TESTIMONIALS</h2>
      </div>
      <div className="testimonials-layout">
        <div className="testimonials-visual">
          <div className="image-container">
            <img
              src={imageSrc}
              alt={current.name}
              className="testimonials-image"
              ref={imageRef}
              onLoad={() => requestAnimationFrame(() => ScrollTrigger.refresh())}
            />
          </div>

          <div className="testimonials-nav">
            <button type="button" onClick={prevTestimonial} className="nav-btn cursor-hover">
              ← PREV
            </button>
            <div className="nav-progress">
              <div
                className="progress-bar"
                style={{ width: `${((index + 1) / testimonials.length) * 100}%` }}
              />
            </div>
            <button type="button" onClick={nextTestimonial} className="nav-btn cursor-hover">
              NEXT →
            </button>
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
