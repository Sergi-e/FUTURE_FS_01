import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: 'QUANTUM ANALYTICS',
    subtitle: 'Full-Stack Data Engine',
    year: '2025',
    link: 'https://github.com/Sergi-e',
  },
  {
    id: 2,
    title: 'ECO-SENTINEL',
    subtitle: 'Marine Conservation Platform',
    year: '2026',
    link: 'https://github.com/Sergi-e',
  },
  {
    id: 3,
    title: 'NEURAL NEXUS',
    subtitle: 'AI-Driven System Architecture',
    year: '2026',
    link: 'https://github.com/Sergi-e',
  },
];

export default function Works() {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${wrapperRef.current.scrollWidth - window.innerWidth}`,
        }
      });

      tl.to(wrapperRef.current, {
        x: () => -(wrapperRef.current.scrollWidth - window.innerWidth),
        ease: 'none',
      });
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="works" ref={sectionRef}>
      <div className="works-header">
        <h2>SELECTED ARCHIVES</h2>
        <span className="works-count">[ 0{projects.length} ]</span>
      </div>
      
      <div className="works-wrapper" ref={wrapperRef}>
        {projects.map((project) => (
          <div className="work-item" key={project.id}>
            <div className="work-image-placeholder cursor-hover">
              <div className="work-overlay"></div>
            </div>
            <div className="work-meta">
              <h3>{project.title}</h3>
              <div className="work-details">
                <span>{project.subtitle}</span>
                <span>{project.year}</span>
              </div>
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-view-more"
                >
                  VIEW MORE →
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
