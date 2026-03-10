import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hobbies.css';

gsap.registerPlugin(ScrollTrigger);

const hobbies = [
  { name: 'BASKETBALL', icon: '🏀', desc: 'Precision & Teamwork' },
  { name: 'RUBIK\'S CUBE SOLVING', icon: '🧩', desc: 'Algorithmic Logic' },
  { name: 'GAMING', icon: '🎮', desc: 'Immersive Strategy' }
];

export default function Hobbies() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.hobby-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'expo.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hobbies" id="hobbies" ref={containerRef}>
      <h2 className="hobbies-title">OFF-THE-CLOCK</h2>
      <div className="hobbies-grid">
        {hobbies.map((hobby, index) => (
          <div key={index} className="hobby-card">
            <span className="hobby-icon">{hobby.icon}</span>
            <h3 className="hobby-name">{hobby.name}</h3>
            <p className="hobby-desc">{hobby.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
