import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import basketballImg from '../assets/basketball_realistic.png';
import rubiksImg from '../assets/rubiks_cube_realistic.png';
import gamepadImg from '../assets/gamepad_realistic.png';
import './Hobbies.css';

gsap.registerPlugin(ScrollTrigger);

const hobbiesData = [
  { id: '01', name: 'BASKETBALL', image: basketballImg, desc: 'The rhythm of the court, the precision of the shot. A game of strategy and split-second decisions.' },
  { id: '02', name: 'RUBIK\'S CUBE', image: rubiksImg, desc: 'Algorithmic beauty in the palm of my hand. Solving the complex through logical progression.' },
  { id: '03', name: 'GAMING', image: gamepadImg, desc: 'Immersive worlds and tactical depth. Exploring digital frontiers and competitive strategy.' }
];

const booksData = [
  { id: 'b1', title: 'The Pragmatic Programmer', image: 'https://covers.openlibrary.org/b/id/10143650-L.jpg' },
  { id: 'b2', title: 'Think Like a Programmer', image: 'https://covers.openlibrary.org/b/id/11917842-L.jpg' },
  { id: 'b3', title: '48 Laws of Power', image: 'https://covers.openlibrary.org/b/id/6424160-L.jpg' },
  { id: 'b4', title: 'Laws of Human Nature', image: 'https://covers.openlibrary.org/b/id/10170095-L.jpg' },
  { id: 'b5', title: 'Atomic Habits', image: 'https://covers.openlibrary.org/b/id/12539702-L.jpg' }
];

export default function Hobbies() {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);
  const booksWrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((item, index) => {
        const image = item.querySelector('.hobby-float-img');
        const text = item.querySelector('.hobby-name-big');

        gsap.fromTo(image, 
          { y: 50, rotate: -10, opacity: 0 },
          { 
            y: -50, 
            rotate: 10, 
            opacity: 1,
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );

        gsap.fromTo(text,
          { x: index % 2 === 0 ? -100 : 100, opacity: 0 },
          {
            x: 0,
            opacity: 0.1,
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "top 20%",
              scrub: true
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollLeft = () => {
    if(booksWrapperRef.current) {
      booksWrapperRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if(booksWrapperRef.current) {
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
        {hobbiesData.map((hobby, index) => (
          <div 
            key={hobby.id} 
            className="hobby-row-alt" 
            ref={el => itemsRef.current[index] = el}
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
          <h2 className="hobbies-main-title" style={{ fontSize: '2.5rem' }}>BOOKS I READ</h2>
        </div>
        <div className="books-marquee-container">
          <button className="book-scroll-btn left" onClick={scrollLeft} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="books-marquee-wrapper" ref={booksWrapperRef}>
            <div className="books-marquee">
              {booksData.map((book, idx) => (
                <div key={idx} className="book-item">
                  <img src={book.image} alt={book.title} className="book-img" />
                </div>
              ))}
            </div>
          </div>
          <button className="book-scroll-btn right" onClick={scrollRight} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
