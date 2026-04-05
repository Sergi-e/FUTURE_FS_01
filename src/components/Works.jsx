import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

function projectMediaType(project) {
  const t = project?.mediaType;
  if (t === 'image' || t === 'video' || t === 'placeholder') return t;
  const p = String(project?.mediaPath ?? '').trim().toLowerCase();
  if (!p) return 'placeholder';
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(p)) return 'video';
  return 'image';
}

export default function Works() {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;

    let ctx = gsap.context(() => {
      const workItems = gsap.utils.toArray('.work-item');
      
      // Initial positioning: Stack items on top of each other
      gsap.set(workItems, { zIndex: (i) => workItems.length - i });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * workItems.length * 1.5}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Pause at the start to let user read the first project
      tl.to({}, { duration: 1 });

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
          duration: 1
        });
        
        // Pause to let user read the NEXT project 
        tl.to({}, { duration: 1 });
      });
      
    }, sectionRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, [projects]);

  return (
    <section className="works" id="projects" ref={sectionRef}>
      <div className="works-header">
        <h2>FEATURED PROJECTS</h2>
      </div>
      
      <div className="works-wrapper" ref={wrapperRef}>
        {projects.length === 0 && <div className="work-item"><h3 style={{color: 'white'}}>Loading Projects...</h3></div>}
        {projects.map((project) => {
          const hasLink = Boolean(project.link && String(project.link).trim());
          const mediaKind = projectMediaType(project);
          const mediaSrc = resolveMediaUrl(project.mediaPath);
          const inner = (
            <>
              <div className="work-media-container cursor-hover">
                {mediaKind === 'image' && mediaSrc && (
                  <img src={mediaSrc} alt={project.title} className="work-media-asset" />
                )}
                {mediaKind === 'image' && !mediaSrc && (
                  <div className="work-image-placeholder"></div>
                )}
                {mediaKind === 'video' && mediaSrc && (
                  <video src={mediaSrc} autoPlay muted loop playsInline className="work-media-asset" />
                )}
                {mediaKind === 'video' && !mediaSrc && (
                  <div className="work-image-placeholder"></div>
                )}
                {mediaKind === 'placeholder' && (
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
                {hasLink && (
                  <span className="work-view-more">VIEW MORE →</span>
                )}
              </div>
            </>
          );

          return hasLink ? (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="work-item"
            >
              {inner}
            </a>
          ) : (
            <div key={project.id} className="work-item work-item--static">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
