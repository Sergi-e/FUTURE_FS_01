import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const prevScrollPos = useRef(window.pageYOffset);
  const menuRef = useRef(null);
  const linksRef = useRef([]);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos.current > currentScrollPos || currentScrollPos < 10;
      
      setScrolled(currentScrollPos > 50);

      if (!isOpen) { 
        setVisible(isVisible);
      }
      prevScrollPos.current = currentScrollPos;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(menuRef.current, {
        clipPath: 'circle(150% at 95% 50%)',
        scale: 1,
        duration: 1.2,
        ease: 'power4.inOut'
      });
      gsap.fromTo(linksRef.current, 
        { y: 80, rotate: 2, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.4 }
      );
      gsap.fromTo('.menu-discovery-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.6 }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(menuRef.current, {
        clipPath: 'circle(0% at 95% 5%)',
        scale: 0.95,
        duration: 0.8,
        ease: 'power4.inOut'
      });
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'PHILOSOPHY', href: '#philosophy' },
    { name: 'SKILLS', href: '#skills' },
    { name: 'PROJECTS', href: '#projects' },
    { name: 'TESTIMONIALS', href: '#testimonials' },
    { name: 'HOBBIES', href: '#hobbies' },
    { name: 'CONTACT', href: '#contact' }
  ];

  return (
    <nav className={`navbar ${!visible ? 'hidden' : ''} ${isOpen ? 'menu-open' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <div className="nav-logo">SERGE ISHIMWE</div>
      </div>

      <div className="nav-right">
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="desktop-link" onClick={() => setIsOpen(false)}>
              {link.name}
            </a>
          ))}
        </div>
        <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>

      <div className="nav-menu" ref={menuRef}>
        <div className="nav-menu-content">
          <div className="menu-left-col">
            <div className="menu-discovery-card">
              <p className="discovery-text">
                Thank you for your interest in knowing what I do. 
                <span>To know more about me, navigate through my portfolio.</span>
              </p>
              <div className="shiny-arrow">
                <svg viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10H95M95 10L85 1M95 10L85 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="menu-right-col">
            <div className="nav-links-grid">
              {navLinks.map((link, index) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="nav-link-item"
                  onClick={() => setIsOpen(false)}
                  ref={el => {
                    if (el) linksRef.current[index] = el;
                  }}
                >
                  <div className="link-wrapper" data-text={link.name}>
                    <span className="link-num">0{index + 1}</span>
                    <span className="link-title">{link.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="menu-footer">
          <div className="menu-contact-exclusive">
            <span>GET IN TOUCH</span>
            <a href="mailto:ishserge16@gmail.com" className="menu-email-link">
              ishserge16@gmail.com
              <span className="email-underline"></span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
