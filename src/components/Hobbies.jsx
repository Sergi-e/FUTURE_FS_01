import React, { useLayoutEffect, useRef, useEffect, useState, useId } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import basketballImg from '../assets/serge_basketball.png';
import rubiksImg from '../assets/rubiks_cube_moody.png';
import gamepadImg from '../assets/gamepad_moody.png';
import headphonesImg from '../assets/headphones_realistic.png';
import footballImg from '../assets/football_realistic.png';
import { publicAssetPath } from '../lib/mediaUrl';
import coverByTitle from '../../covers.json';
import './Hobbies.css';

gsap.registerPlugin(ScrollTrigger);

function olIsbnCovers(isbn13) {
  const d = String(isbn13).replace(/-/g, '');
  return [
    `https://covers.openlibrary.org/b/isbn/${d}-L.jpg`,
    `https://covers.openlibrary.org/b/isbn/${d}-M.jpg`,
    `https://covers.openlibrary.org/b/isbn/${d}-S.jpg`,
  ];
}

/** OL often has no ISBN→cover mapping; edition cover ids from openlibrary.org are reliable. */
function olCoverIds(...numericIds) {
  return numericIds.flatMap((id) => [
    `https://covers.openlibrary.org/b/id/${id}-L.jpg`,
    `https://covers.openlibrary.org/b/id/${id}-M.jpg`,
    `https://covers.openlibrary.org/b/id/${id}-S.jpg`,
  ]);
}

function BookCoverImg({ sources, alt, className }) {
  const list = sources.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const src = list[Math.min(idx, Math.max(0, list.length - 1))] ?? '';

  if (!list.length) return null;

  const amazon = /amazon\.com|media-amazon\.com/i.test(src);

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      referrerPolicy={amazon ? 'no-referrer' : undefined}
      onError={() => setIdx((i) => (i + 1 < list.length ? i + 1 : i))}
    />
  );
}

/** Single carousel: Rubik & Gaming on the sides; middle three between them */
const hobbiesData = [
  {
    id: '02',
    name: 'RUBIK\'S CUBE',
    image: rubiksImg,
    desc: "Every scramble is a puzzle with a solution. I just have to find the path.",
  },
  {
    id: '01',
    name: 'BASKETBALL',
    image: basketballImg,
    desc: 'On the court is where I learned to think fast, adapt faster, and never overthink the shot.',
  },
  {
    id: '03',
    name: 'MUSIC AND SOUNDS',
    image: headphonesImg,
    desc: "Lo-fi when I'm building, loud when I'm not. Music sets the pace.",
  },
  {
    id: '05',
    name: 'THE BEAUTIFUL GAME',
    image: footballImg,
    desc: 'I play it, I watch it, I live it. Blaugrana or Gunner.',
  },
  {
    id: '04',
    name: 'GAMING',
    image: gamepadImg,
    desc: 'Still learning the maps, but I never quit a game.',
  },
];

/** Prefer bundled public files when present; Open Library /b/id/ and ISBN fallbacks if missing or blocked. */
const booksData = [
  {
    id: 'b1',
    title: 'The Pragmatic Programmer',
    sources: [publicAssetPath('/assets/books/b1.jpg'), coverByTitle['The Pragmatic Programmer']],
  },
  {
    id: 'b2',
    title: 'Think Like a Programmer',
    sources: [publicAssetPath('/assets/books/b2.jpg'), coverByTitle['Think Like a Programmer']],
  },
  {
    id: 'b3',
    title: '48 Laws of Power',
    sources: [publicAssetPath('/assets/books/b3.jpg'), coverByTitle['48 Laws of Power']],
  },
  {
    id: 'b4',
    title: 'Laws of Human Nature',
    sources: [
      publicAssetPath('/assets/books/b4.jpg'),
      coverByTitle['The Laws of Human Nature'],
    ],
  },
  {
    id: 'b5',
    title: 'Atomic Habits',
    sources: [publicAssetPath('/assets/books/b5.jpg'), coverByTitle['Atomic Habits']],
  },
  {
    id: 'b6',
    title: 'The Richest Man in Babylon',
    sources: olIsbnCovers('9780451205360'),
  },
  {
    id: 'b7',
    title: 'Think and Grow Rich',
    sources: [
      'https://m.media-amazon.com/images/I/61IxJuRI39L._AC_UF1000,1000_QL80_.jpg',
      ...olCoverIds(14542536),
      coverByTitle['Think and Grow Rich'],
      ...olIsbnCovers('9781937875080'),
      ...olIsbnCovers('9780440213373'),
      ...olIsbnCovers('9781585424331'),
    ],
  },
  {
    id: 'b8',
    title: 'The Millionaire Fastlane',
    sources: olIsbnCovers('9780984358106'),
  },
  {
    id: 'b9',
    title: 'Self-Discipline (Brian Tracy)',
    sources: [
      'https://m.media-amazon.com/images/I/71y6Sj4BVOL._AC_UF1000,1000_QL80_.jpg',
      ...olCoverIds(9387740, 7984635),
      coverByTitle['Self-Discipline (Brian Tracy)'],
      ...olIsbnCovers('9781593155811'),
    ],
  },
  {
    id: 'b10',
    title: 'The Alchemist',
    sources: olIsbnCovers('9780062315007'),
  },
];

export default function Hobbies() {
  const carouselRailGradId = useId().replace(/:/g, '');
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const booksWrapperRef = useRef(null);
  const cardRefs = useRef([]);
  // const progressBarRef = useRef(null); // Progress bar removed per inspiration design

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    let resizeObserver;
    const refreshST = () => ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      const container = root.querySelector('.hobbies-carousel-container');
      const cards = root.querySelectorAll('.hobby-card');
      
      if (cards.length > 0 && container) {
        gsap.set(cards, { opacity: 0 });

        const ioEntrance = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            gsap.fromTo(cards, 
              {
                opacity: 0,
                y: 150,
                scale: 0.8
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: 'back.out(1.2)',
                clearProps: 'transform' 
              }
            );
            ioEntrance.disconnect();
          }
        }, { threshold: 0.15 });
        ioEntrance.observe(container);
      }
    }, root);

    const hobbyImgs = root.querySelectorAll('.hobby-card-img');
    hobbyImgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', refreshST, { once: true });
      img.addEventListener('error', refreshST, { once: true });
    });

    resizeObserver = new ResizeObserver(() => refreshST());
    resizeObserver.observe(root);
    queueMicrotask(refreshST);
    const refreshLater = window.setTimeout(refreshST, 120);

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

  // 2D Arc Carousel Logic
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rAF;
    
    // Auto-scroll to center on mount so it matches the aesthetic immediately
    setTimeout(() => {
      const trackWidth = track.clientWidth;
      const mScroll = track.scrollWidth - trackWidth;
      // Scroll to midpoint
      if (mScroll > 0) {
        track.scrollLeft = mScroll / 2;
      }
    }, 50);

    const updateCards = () => {
      const trackWidth = track.clientWidth;
      const trackCenter = trackWidth / 2;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        
        const cardCenter = card.offsetLeft + card.offsetWidth / 2 - track.scrollLeft;
        const distance = cardCenter - trackCenter;
        
        // Reference: ~±17° side tilt, center upright; gentle vertical arc on the rail
        const normalized = Math.max(-1, Math.min(1, distance / (trackWidth * 0.36)));

        const absNorm = Math.abs(normalized);
        const scale = 1 - absNorm * 0.085;
        const rotateZ = normalized * 17;
        const yTranslate = Math.pow(absNorm, 1.32) * 46;
        const opacity = 1 - Math.pow(absNorm, 2) * 0.4;

        // Text opacity logic: fades out sharply if not centered
        const contentOpacity = 1 - Math.min(1, absNorm * 2.5); 
        const contentY = absNorm * 10; 

        const inner = card.querySelector('.hobby-card-inner');
        const content = card.querySelector('.hobby-card-content');

        if (inner) {
          inner.style.transform = `translateY(${yTranslate}px) rotateZ(${rotateZ}deg) scale(${scale})`;
          inner.style.opacity = opacity.toFixed(2);
        }

        if (content) {
          content.style.opacity = contentOpacity.toFixed(2);
          content.style.transform = `translateY(${contentY}px)`;
          content.style.pointerEvents = absNorm > 0.3 ? 'none' : 'auto';
        }
      });
    };

    const handleScroll = () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(updateCards);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    
    setTimeout(updateCards, 100);
    window.addEventListener('resize', handleScroll);

    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(rAF);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      track.classList.add('active');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      track.classList.remove('active');
    };

    const onMouseUp = () => {
      isDown = false;
      track.classList.remove('active');
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      // Inverse drag mapping + slightly slower
      const walk = (x - startX) * 1.5; 
      track.scrollLeft = scrollLeft - walk;
    };

    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mouseleave', onMouseLeave);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mousemove', onMouseMove);

    return () => {
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mouseleave', onMouseLeave);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const scrollLeftBook = () => {
    if (booksWrapperRef.current) {
      booksWrapperRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRightBook = () => {
    if (booksWrapperRef.current) {
      booksWrapperRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="hobbies-innovative" id="hobbies" ref={sectionRef}>
      <div className="hobbies-header-alt">
        <span className="hobbies-tag-alt">OFF THE CLOCK</span>
        <h2 className="hobbies-main-title">LIFE OUTSIDE THE CODE</h2>
      </div>

      <div className="hobbies-carousel-container">
        <div className="hobbies-arc"></div>

        {/* Upward-curving rail behind cards (reference: thin arc through gaps, links the row) */}
        <div className="hobbies-carousel-rail" aria-hidden="true">
          <svg
            className="hobbies-carousel-rail-svg"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id={carouselRailGradId}
                x1="0"
                y1="0"
                x2="1200"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.08" stopColor="#fff" stopOpacity="0.09" />
                <stop offset="0.24" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.26" />
                <stop offset="0.76" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="0.92" stopColor="#fff" stopOpacity="0.09" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 86 Q 600 4 1200 86"
              fill="none"
              stroke={`url(#${carouselRailGradId})`}
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="nonScalingStroke"
            />
          </svg>
        </div>

        <div className="hobbies-carousel-track" ref={trackRef}>
          <div className="hobby-edge-spacer" aria-hidden="true" />
          {hobbiesData.map((hobby, index) => (
            <div 
              key={hobby.id} 
              className="hobby-card"
              ref={el => { cardRefs.current[index] = el; }}
            >
              <div className="hobby-card-inner">
                <div className="hobby-card-img-wrapper">
                  <img src={hobby.image} alt={hobby.name} className="hobby-card-img" draggable="false" />
                </div>
                
                <div className="hobby-card-content">
                  <h3 className="hobby-card-title">{hobby.name}</h3>
                  <p className="hobby-card-desc">{hobby.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="hobby-edge-spacer" aria-hidden="true" />
        </div>
      </div>

      <div className="hobbies-books-divider" aria-hidden="true">
        <svg
          className="hobbies-books-divider-svg"
          viewBox="0 0 1200 48"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 36 Q 600 10 1200 36"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            vectorEffect="nonScalingStroke"
          />
        </svg>
      </div>

      <div className="books-section">
        <div className="hobbies-header-alt books-section-header">
          <span className="hobbies-tag-alt">READING LIST</span>
          <p className="books-section-intro">
            Code isn&apos;t the only thing I study. These are the books that shaped how I think.
          </p>
        </div>
        <div className="books-marquee-container">
          <button type="button" className="book-scroll-btn left" onClick={scrollLeftBook} aria-label="Scroll left">
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
                  <BookCoverImg sources={book.sources} alt={book.title} className="book-img" />
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="book-scroll-btn right" onClick={scrollRightBook} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
