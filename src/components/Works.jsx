import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { 
    id: 1, 
    title: 'BE THE LIGHT WEBSITE', 
    subtitle: 'Impactful Community Hub built with Lovable', 
    year: '2025',
    link: 'https://bethe-light-hub.lovable.app/'
  },
  { 
    id: 2, 
    title: 'CLIMATE CHANGE IMPACT', 
    subtitle: 'Marine Life Monitoring & Data Visualization via ArcGIS', 
    year: '2026',
    link: 'https://arcg.is/09v5GS1'
  },
  { 
    id: 3, 
    title: 'NEURAL NEXUS', 
    subtitle: 'AI-Powered Project Management Hub', 
    year: '2026',
    link: '#' 
  },
];

export default function Works() {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const workItems = gsap.utils.toArray('.work-item');
      
      // Initial positioning: all items except first are off-screen at bottom
      gsap.set(workItems.slice(1), { yPercent: 100 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * workItems.length}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Animate each item to slide up over the current one
      workItems.forEach((item, i) => {
        if (i === 0) return; // Skip first item as it's already there
        
        tl.to(item, {
          yPercent: 0,
          ease: "none",
        });
      });
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="works" id="projects" ref={sectionRef}>
      <div className="works-header">
        <h2>FEATURED PROJECTS</h2>
        <span className="works-count">[ 0{projects.length} ]</span>
      </div>
      
      <div className="works-wrapper" ref={wrapperRef}>
        {projects.map((project) => (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="work-item" key={project.id}>
            <div className="work-image-placeholder cursor-hover">
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
