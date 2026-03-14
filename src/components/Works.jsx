import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import bethelightImg from '../assets/bethelight.png';
import kivuVid from '../assets/kivu.mp4';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { 
    id: 1, 
    title: 'BE THE LIGHT WEBSITE', 
    subtitle: 'Impactful Community Hub built with Lovable', 
    year: '2025',
    link: 'https://bethe-light-hub.lovable.app/',
    mediaType: 'image',
    mediaPath: bethelightImg
  },
  { 
    id: 2, 
    title: 'CLIMATE CHANGE IMPACT', 
    subtitle: 'Marine Life Monitoring & Data Visualization via ArcGIS', 
    year: '2026',
    link: 'https://arcg.is/09v5GS1',
    mediaType: 'video',
    mediaPath: kivuVid
  },
  { 
    id: 3, 
    title: 'NEURAL NEXUS', 
    subtitle: 'AI-Powered Project Management Hub', 
    year: '2026',
    link: '#',
    mediaType: 'placeholder'
  },
];

export default function Works() {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const workItems = gsap.utils.toArray('.work-item');
      
      // Initial positioning: Stack items on top of each other
      // They are already absolutely positioned in CSS
      gsap.set(workItems, { zIndex: (i) => workItems.length - i });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (workItems.length)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Diagonal Slide-away transition (Bottom-Left)
      workItems.forEach((item, i) => {
        if (i === workItems.length - 1) return; // Last item doesn't slide away
        
        tl.to(item, {
          xPercent: -100,
          yPercent: 100,
          rotate: -15,
          scale: 0.8,
          opacity: 0,
          ease: "none",
        }, i); // Each transition happens sequentially based on scroll
      });
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="works" id="projects" ref={sectionRef}>
      <div className="works-header">
        <h2>FEATURED PROJECTS</h2>
      </div>
      
      <div className="works-wrapper" ref={wrapperRef}>
        {projects.map((project) => (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="work-item" key={project.id}>
            <div className="work-media-container cursor-hover">
              {project.mediaType === 'image' && (
                <img src={project.mediaPath} alt={project.title} className="work-media-asset" />
              )}
              {project.mediaType === 'video' && (
                <video src={project.mediaPath} autoPlay muted loop playsInline className="work-media-asset" />
              )}
              {project.mediaType === 'placeholder' && (
                <div className="work-image-placeholder"></div>
              )}
              <div className="work-overlay"></div>
            </div>
            <div className="work-meta">
              <h3>{project.title}</h3>
              <div className="work-details">
                <span>{project.subtitle}</span>
                <span>{project.year}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
