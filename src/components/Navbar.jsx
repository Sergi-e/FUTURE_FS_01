import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const linksRef = useRef([]);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      gsap.to(menuRef.current, {
        clipPath: 'circle(150% at 100% 0%)',
        scale: 1,
        duration: 1.2,
        ease: 'power4.inOut'
      });
      gsap.fromTo(linksRef.current, 
        { y: 100, rotate: 5, opacity: 0 },
        { y: 0, rotate: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
      );
    } else {
      gsap.to(menuRef.current, {
        clipPath: 'circle(0% at 95% 5%)',
        scale: 0.9,
        duration: 0.8,
        ease: 'power4.inOut'
      });
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'PHILOSOPHY', href: '#philosophy' },
    { name: 'HOBBIES', href: '#hobbies' },
    { name: 'TESTIMONIALS', href: '#testimonials' },
    { name: 'PROJECTS', href: '#projects' },
    { name: 'CONTACT', href: '#contact' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="nav-logo">SERGE</div>
        
        <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>

      <div className="nav-right">
        {/* Placeholder for potential right-side items, ThemeSwitcher is fixed anyway */}
      </div>

      <div className="nav-menu" ref={menuRef}>
        <div className="nav-links">
          {navLinks.map((link, index) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="nav-link"
              onClick={() => setIsOpen(false)}
              ref={el => linksRef.current[index] = el}
            >
              <span className="link-number">0{index + 1}</span>
              <span className="link-text">{link.name}</span>
            </a>
          ))}
        </div>
        
        <div className="menu-footer">
          <div className="social-links">
            <a href="https://linkedin.com/in/ishimwe-serge/" target="_blank" rel="noopener noreferrer">LN</a>
            <a href="https://github.com/Sergi-e" target="_blank" rel="noopener noreferrer">GH</a>
          </div>
          <p>ISHSERGE16@GMAIL.COM</p>
        </div>
      </div>
    </nav>
  );
}
