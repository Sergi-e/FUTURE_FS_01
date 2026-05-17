import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { postJson } from '../lib/apiClient';
import { isValidEmailFormat } from '../lib/emailValidation';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const titleRef = useRef(null);
  const ctaRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = titleRef.current;
      if (el) {
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
              once: true,
            },
          }
        );
      }
      const cta = ctaRef.current;
      if (cta) {
        gsap.fromTo(
          cta,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: 0.15,
            scrollTrigger: {
              trigger: cta,
              start: 'top 90%',
              once: true,
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    const name = formData.name.trim();
    const message = formData.message.trim();
    if (!isValidEmailFormat(email)) {
      setStatus('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    setStatus('Sending...');
    try {
      await postJson('/contact', { name, email, message });
      setStatus('Message successfully sent!');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => { setShowForm(false); setStatus(''); }, 3000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Error connecting to server.');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-bg-texture" aria-hidden="true" />

      <div className="contact-container">
        <h2 ref={titleRef} className="contact-title">LET&apos;S CONNECT</h2>

        <div ref={ctaRef} className="contact-cta-block">
          <p className="contact-cta-text">Got a project in mind?</p>

          <a
            href="mailto:ishserge16@gmail.com"
            className="contact-email-btn"
          >
            Send me an email
          </a>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="contact-form-trigger"
            >
              Or fill out the contact form
            </button>
          )}
        </div>

        {showForm && (
          <div className="contact-form-wrap">
            <form
              noValidate
              onSubmit={handleSubmit}
              className="inpage-contact-form"
            >
              <h3 className="contact-form-heading">SEND A MESSAGE</h3>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="contact-input"
              />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="contact-input"
              />
              <textarea
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                required
                className="contact-input contact-textarea"
              />
              <div className="contact-form-actions">
                <button type="submit" className="contact-submit-btn">SEND</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="contact-close-btn"
                >
                  CLOSE FORM
                </button>
              </div>
              {status && (
                <p
                  className={`contact-status ${
                    status !== 'Sending...' && status !== 'Message successfully sent!'
                      ? 'contact-status--error'
                      : ''
                  }`}
                >
                  {status}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-left">
          <span className="footer-copyright">
            © 2026 Serge Ishimwe. All rights reserved.
          </span>
        </div>
        <div className="footer-right">
          <a
            href="https://www.linkedin.com/in/ishimwe-serge/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link linkedin-link cursor-hover"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>LINKEDIN</span>
          </a>
          <a
            href="https://github.com/Sergi-e"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link github-link cursor-hover"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.025 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>GITHUB</span>
          </a>
        </div>
      </footer>
    </section>
  );
}
