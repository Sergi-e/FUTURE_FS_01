import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const titleRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const button = buttonRef.current;
    const text = textRef.current;
    if (!button || !text) return;

    const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const xTextTo = gsap.quickTo(text, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTextTo = gsap.quickTo(text, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * 0.4);
      yTo(y * 0.4);
      xTextTo(x * 0.2);
      yTextTo(y * 0.2);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      xTextTo(0);
      yTextTo(0);
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('Message successfully sent!');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => { setShowForm(false); setStatus(''); }, 3000);
      } else {
        setStatus('Message failed. Try again.');
      }
    } catch (err) {
      setStatus('Error connecting to server.');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-container" style={{ width: '100%' }}>
        <h2 ref={titleRef} className="contact-title" style={{ marginBottom: '2rem' }}>LET&apos;S CONNECT</h2>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: showForm ? 'row' : 'column', 
          flexWrap: 'wrap',
          gap: showForm ? '5vw' : '2rem',
          justifyContent: 'center',
          alignItems: showForm ? 'flex-start' : 'center',
          width: '100%', 
          maxWidth: '1000px',
          margin: '0 auto',
          transition: 'all 0.5s ease'
        }}>
          
          <div className="contact-methods-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="magnetic-button-wrapper">
              <a href="mailto:ishserge16@gmail.com" ref={buttonRef} className="magnetic-button gmail-link" style={{border: 'none', cursor: 'pointer', textDecoration: 'none'}}>
                <span ref={textRef} className="magnetic-text">EMAIL ME</span>
                <div className="gmail-icon-hover">
                  <svg viewBox="0 0 24 24" width="45" height="45">
                    <path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7l-9 7-9-7v14H1.5C.65 21 0 20.35 0 19.5v-15c0-1.1.9-2 2-2h1.5l8.5 6.6L20.5 2.5H22c1.1 0 2 .9 2 2z" fill="#EA4335" />
                    <path d="M24 4.5V6L12 15 0 6V4.5c0-1.1.9-2 2-2h1.5l8.5 6.6L20.5 2.5H22c1.1 0 2 .9 2 2z" fill="#FBBC05" />
                    <path d="M0 4.5v15c0 .85.65 1.5 1.5 1.5H6V7l-6-4.5z" fill="#4285F4" />
                    <path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H18V7l6-4.5z" fill="#34A853" />
                  </svg>
                  <span className="gmail-text-logo">
                    <span style={{color: '#4285F4'}}>G</span>
                    <span style={{color: '#EA4335'}}>m</span>
                    <span style={{color: '#FBBC05'}}>a</span>
                    <span style={{color: '#EA4335'}}>i</span>
                    <span style={{color: '#34A853'}}>l</span>
                  </span>
                </div>
              </a>
            </div>

            <div className="whatsapp-link-container" style={{ marginTop: '1.5rem' }}>
              <a href="https://wa.me/250789353600" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                <span className="wa-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <span>+250 789353600</span>
              </a>
            </div>

            {!showForm && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                  onClick={() => setShowForm(true)} 
                  style={{
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent-neon)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  For booking or other inquiries, click here to fill the form.
                </button>
              </div>
            )}
          </div>

          {showForm && (
            <div className="contact-form-right" style={{ flex: '1', minWidth: '350px', maxWidth: '500px', animation: 'fadeInRight 0.5s ease forwards' }}>
              <form onSubmit={handleSubmit} className="inpage-contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#111', padding: '30px', borderRadius: '12px', width: '100%', textAlign: 'left' }}>
                <h3 style={{fontFamily: 'var(--font-display)', color: 'var(--accent-neon)', marginBottom: '10px'}}>SEND A MESSAGE / FREELANCING DEALS</h3>
                <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{padding: '12px', border: '1px solid #333', borderRadius: '6px', background: '#0a0a0a', color: 'white', fontFamily: 'var(--font-sans)'}}/>
                <input type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{padding: '12px', border: '1px solid #333', borderRadius: '6px', background: '#0a0a0a', color: 'white', fontFamily: 'var(--font-sans)'}}/>
                <textarea placeholder="Your Message" rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required style={{padding: '12px', border: '1px solid #333', borderRadius: '6px', background: '#0a0a0a', color: 'white', fontFamily: 'var(--font-sans)', resize: 'vertical'}}/>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <button type="submit" style={{padding: '12px 24px', background: 'var(--accent-neon)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-sans)'}}>SEND</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{background: 'transparent', color: '#ff4a4a', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)'}}>CLOSE FORM</button>
                </div>
                {status && <p style={{color: status.includes('failed') || status.includes('Error') ? '#ff4a4a' : 'white', fontSize: '0.9rem', marginTop: '10px'}}>{status}</p>}
              </form>
            </div>
          )}

        </div>
      </div>
      
      {showForm && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}} />
      )}

      <footer className="footer" style={{ marginTop: '5vh' }}>
        <div className="footer-left">
          <span style={{ fontSize: '0.85rem', fontWeight: '300', letterSpacing: '0.05em' }}>Copyright © 2026 Serge Ishimwe</span>
        </div>
        <div className="footer-right">
          <a href="https://www.linkedin.com/in/ishimwe-serge/" target="_blank" rel="noopener noreferrer" className="footer-social-link linkedin-link cursor-hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            <span>LINKEDIN</span>
          </a>
          <a href="https://github.com/Sergi-e" target="_blank" rel="noopener noreferrer" className="footer-social-link github-link cursor-hover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.025 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span>GITHUB</span>
          </a>
        </div>
      </footer>
    </section>
  );
}
