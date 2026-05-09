import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Navbar.css';

const NAV_LINKS = [
  { name: 'HOME', href: '#home' },
  { name: 'APPROACH', href: '#approach' },
  { name: 'PROJECTS', href: '#projects' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'TESTIMONIALS', href: '#testimonials' },
  { name: 'HOBBIES', href: '#hobbies' },
  { name: 'CONTACT', href: '#contact' }
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace(/^#/, ''));

/** Pinned / tall sections break ScrollTrigger start/end; use what’s under the bar. */
function detectSectionUnderNav() {
  const nav = document.querySelector('.navbar');
  const probeY = Math.min(
    Math.max((nav?.getBoundingClientRect().bottom ?? 56) + 4, 8),
    window.innerHeight - 8
  );
  const x = Math.max(8, Math.min(window.innerWidth - 8, window.innerWidth / 2));

  const stack = document.elementsFromPoint(x, probeY);
  for (const node of stack) {
    const sec = typeof node.closest === 'function' ? node.closest('section') : null;
    const id = sec?.id;
    if (id && SECTION_IDS.includes(id)) {
      return `#${id}`;
    }
  }

  let fallback = SECTION_IDS[0];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= probeY && r.bottom > probeY) {
      return `#${id}`;
    }
  }
  for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
    const id = SECTION_IDS[i];
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= probeY) {
      fallback = id;
      break;
    }
  }
  return `#${fallback}`;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const menuRef = useRef(null);
  const linksRef = useRef([]);
  const lastScrollY = useRef(0);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((wasOpen) => {
      if (!wasOpen) {
        setNavHidden(false);
        setQuickJumpOpen(false);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    let ticking = false;

    const updateActive = () => {
      setActiveSection(detectSectionUnderNav());
    };

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

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateActive();
        });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    requestAnimationFrame(() => updateActive());
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
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

  const showQuickJumpChrome = scrolled && !isOpen;
  const quickJumpVisible = showQuickJumpChrome && quickJumpOpen;

  const jumpTo = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setQuickJumpOpen(false);
  };

  return (
    <nav
      className={`navbar ${isOpen ? 'menu-open' : ''} ${scrolled ? 'scrolled' : ''} ${navHidden && !isOpen ? 'navbar--hidden' : ''}`}
      data-section={activeSection}
    >
      <div className="navbar-top">
        <div className="nav-left">
          <div className="nav-logo">SERGE ISHIMWE</div>
        </div>

        <div
          className="nav-right"
          onMouseEnter={() => showQuickJumpChrome && setQuickJumpOpen(true)}
          onMouseLeave={() => setQuickJumpOpen(false)}
        >
          {showQuickJumpChrome && (
            <button
              type="button"
              className={`nav-quick-jump-toggle ${quickJumpOpen ? 'is-active' : ''}`}
              aria-label="Section shortcuts"
              aria-expanded={quickJumpOpen}
              aria-haspopup="true"
              onClick={(e) => {
                e.stopPropagation();
                setQuickJumpOpen((v) => !v);
              }}
            >
              <span className="nav-quick-jump-toggle-icon" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="nav-quick-jump-toggle-label">Jump</span>
            </button>
          )}
          <button className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </button>

          <aside
            className={`nav-quick-jump ${quickJumpVisible ? 'nav-quick-jump--visible' : ''}`}
            aria-hidden={!quickJumpVisible}
          >
            <p className="nav-quick-jump-eyebrow">Jump to</p>
            <div className="nav-quick-jump-grid" role="navigation" aria-label="Sections">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`nav-quick-jump-link ${activeSection === link.href ? 'nav-quick-jump-link--active' : ''}`}
                  onClick={(e) => jumpTo(e, link.href)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="nav-menu" ref={menuRef}>
        <div className="nav-menu-content">
          <div className="menu-left-col">
            <div className="menu-discovery-card">
              <p className="discovery-text">
                Here is everything in one place.
                <span>Pick a section and explore.</span>
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
