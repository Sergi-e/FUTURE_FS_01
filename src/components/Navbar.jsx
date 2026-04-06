import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Navbar.css';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { name: 'HOME', href: '#home' },
  { name: 'APPROACH', href: '#approach' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'PROJECTS', href: '#projects' },
  { name: 'TESTIMONIALS', href: '#testimonials' },
  { name: 'HOBBIES', href: '#hobbies' },
  { name: 'CONTACT', href: '#contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const menuRef = useRef(null);
  const linksRef = useRef([]);
  const lastScrollY = useRef(0);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      if (!prev) setNavHidden(false);
      return !prev;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(y > 50);

      if (y < 10) {
        setNavHidden(false);
      } else if (!isOpenRef.current) {
        if (y > lastScrollY.current) setNavHidden(true);
        else if (y < lastScrollY.current) setNavHidden(false);
      }

      lastScrollY.current = y;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const triggers = [];
    const ctx = gsap.context(() => {
      NAV_LINKS.forEach((link) => {
        const section = document.querySelector(link.href);
        if (!section) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 45%',
            onToggle: (self) => {
              if (self.isActive) setActiveSection(link.href);
            }
          })
        );
      });
    });
    const refreshId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(refreshId);
      triggers.forEach((t) => t.kill());
      ctx.revert();
    };
  }, []);

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

  return (
    <nav
      className={`navbar ${isOpen ? 'menu-open' : ''} ${scrolled ? 'scrolled' : ''} ${navHidden && !isOpen ? 'navbar--hidden' : ''}`}
    >
      <div className="nav-left">
        <div className="nav-logo">SERGE ISHIMWE</div>
      </div>

      <div className="nav-right">
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
              {NAV_LINKS.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`nav-link-item ${activeSection === link.href ? 'nav-link-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                  ref={(el) => {
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
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ishserge16@gmail.com" target="_blank" rel="noopener noreferrer" className="menu-email-link">
              ishserge16@gmail.com
              <span className="email-underline"></span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
