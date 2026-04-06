import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Testimonials.css';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [failedImageKey, setFailedImageKey] = useState(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const infoRef = useRef(null);
  const imageRef = useRef(null);
  /** After index updates, run fade-in on the new DOM (img vs placeholder swap). */
  const pendingFadeInRef = useRef(null);

  useEffect(() => {
    const url = `${API_BASE_URL}/testimonials`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Testimonials ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to fetch testimonials', url, err);
        setTestimonials([]);
      });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [testimonials.length]);

  useLayoutEffect(() => {
    const pending = pendingFadeInRef.current;
    if (!pending) return;
    pendingFadeInRef.current = null;
    const targets = [textRef.current, infoRef.current, imageRef.current].filter(Boolean);
    if (targets.length === 0) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y: pending.enterY },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [index]);

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
    const outgoing = [textRef.current, infoRef.current, imageRef.current].filter(Boolean);

    tl.to(outgoing, {
      opacity: 0,
      y: yOffset,
      duration: 0.3,
      onComplete: () => {
        pendingFadeInRef.current = { enterY: -yOffset };
        setIndex(nextIdx);
      }
    });
  };

  const current = testimonials[index];
  const imageSrc = current ? resolveMediaUrl(current.image) : '';
  const imageKey = current ? `${index}-${imageSrc}` : '';
  const showPortrait = Boolean(imageSrc) && failedImageKey !== imageKey;

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-header">
        <h2 ref={titleRef} className="testimonials-title">TESTIMONIALS</h2>
      </div>
      {testimonials.length > 0 && current && (
        <div className="testimonials-layout">
          <div className="testimonials-visual">
            <div className="image-container">
              {showPortrait ? (
                <img
                  src={imageSrc}
                  alt={current.name || 'Testimonial'}
                  className="testimonials-image"
                  ref={imageRef}
                  loading="eager"
                  decoding="async"
                  onError={() => setFailedImageKey(imageKey)}
                />
              ) : (
                <div className="testimonials-image testimonials-image--placeholder" ref={imageRef} aria-hidden />
              )}
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
