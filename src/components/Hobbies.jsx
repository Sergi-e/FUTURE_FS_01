import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import basketballImg from '../assets/basketball_realistic.png';
import rubiksImg from '../assets/rubiks_cube_realistic.png';
import gamepadImg from '../assets/gamepad_realistic.png';
import { publicAssetPath } from '../lib/mediaUrl';
import './Hobbies.css';

gsap.registerPlugin(ScrollTrigger);

const hobbiesData = [
  { id: '01', name: 'BASKETBALL', image: basketballImg, desc: 'The rhythm of the court, the precision of the shot. A game of strategy and split-second decisions.' },
  { id: '02', name: 'RUBIK\'S CUBE', image: rubiksImg, desc: 'Algorithmic beauty in the palm of my hand. Solving the complex through logical progression.' },
  { id: '03', name: 'GAMING', image: gamepadImg, desc: 'Immersive worlds and tactical depth. Exploring digital frontiers and competitive strategy.' }
];

const booksData = [
  { id: 'b1', title: 'The Pragmatic Programmer', image: publicAssetPath('/assets/books/b1.jpg') },
  { id: 'b2', title: 'Think Like a Programmer', image: publicAssetPath('/assets/books/b2.jpg') },
  { id: 'b3', title: '48 Laws of Power', image: publicAssetPath('/assets/books/b3.jpg') },
  { id: 'b4', title: 'Laws of Human Nature', image: publicAssetPath('/assets/books/b4.jpg') },
  { id: 'b5', title: 'Atomic Habits', image: publicAssetPath('/assets/books/b5.jpg') }
];

export default function Hobbies() {
  const sectionRef = useRef(null);
  const booksWrapperRef = useRef(null);

  /* Scroll-scrubbed parallax — Lenis v1.3+ drives native scroll, ScrollTrigger picks it up automatically */
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    let resizeObserver;

    const refreshST = () => ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      const rows = root.querySelectorAll('.hobby-row-alt');

      rows.forEach((row, index) => {
        const image = row.querySelector('.hobby-float-img');
        const text = row.querySelector('.hobby-name-big');

        if (image) {
          gsap.set(image, { opacity: 0, y: 40 });

          gsap.to(image, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          });

          gsap.to(image, {
            yPercent: -20,
            rotation: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        if (text) {
          gsap.fromTo(
            text,
            { x: index % 2 === 0 ? -80 : 80, opacity: 0 },
            {
              x: 0,
              opacity: 0.12,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      requestAnimationFrame(refreshST);
    }, root);

    const hobbyImgs = root.querySelectorAll('.hobby-float-img');
    hobbyImgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', refreshST, { once: true });
      img.addEventListener('error', refreshST, { once: true });
    });

    resizeObserver = new ResizeObserver(() => refreshST());
    resizeObserver.observe(root);

    queueMicrotask(refreshST);
    const refreshLater = window.setTimeout(refreshST, 120);

    // One refresh when this block is about to enter view — fixes scrub start/end if layout
    // above shifted (e.g. testimonials/projects loaded after first ScrollTrigger.measure).
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
      { root: null, rootMargin: '180px 0px 0px 0px', threshold: 0 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      window.clearTimeout(refreshLater);
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, []);

  const scrollLeft = () => {
    if (booksWrapperRef.current) {
      booksWrapperRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (booksWrapperRef.current) {
      booksWrapperRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="hobbies-innovative" id="hobbies" ref={sectionRef}>
      <div className="hobbies-header-alt">
        <span className="hobbies-tag-alt">OFF THE CLOCK</span>
        <h2 className="hobbies-main-title">PASSIONS & PERSPECTIVES</h2>
      </div>

      <div className="hobbies-list-alt">
        {hobbiesData.map((hobby) => (
          <div
            key={hobby.id}
            className="hobby-row-alt"
          >
            <div className="hobby-content-alt">
              <span className="hobby-num-alt">{hobby.id}</span>
              <div className="hobby-text-alt">
                <h3 className="hobby-title-alt">{hobby.name}</h3>
                <p className="hobby-desc-alt">{hobby.desc}</p>
              </div>
            </div>

            <div className="hobby-visual-alt">
              <h4 className="hobby-name-big">{hobby.name}</h4>
              <img src={hobby.image} alt={hobby.name} className="hobby-float-img" />
            </div>
          </div>
        ))}
      </div>

      <div className="books-section">
        <div className="hobbies-header-alt">
          <span className="hobbies-tag-alt">READING LIST</span>
          <h2 className="hobbies-main-title books-section-title">BOOKS I READ</h2>
        </div>
        <div className="books-marquee-container">
          <button type="button" className="book-scroll-btn left" onClick={scrollLeft} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div
            className="books-marquee-wrapper"
            ref={booksWrapperRef}
            data-lenis-prevent
          >
            <div className="books-marquee">
              {booksData.map((book) => (
                <div key={book.id} className="book-item">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="book-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="book-scroll-btn right" onClick={scrollRight} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
