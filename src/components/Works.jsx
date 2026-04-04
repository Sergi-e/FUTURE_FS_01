import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config/api';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

export default function Works() {
  const pinRef = useRef(null);
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
      const pinEl = pinRef.current;
      if (!pinEl) return;

      const workItems = gsap.utils.toArray('.work-item');
      gsap.set(workItems, { zIndex: (i) => workItems.length - i });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () =>
            `+=${window.innerHeight * Math.max(1.2, 0.75 + workItems.length * 1.2)}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to({}, { duration: 0.85 });

      workItems.forEach((item, i) => {
        if (i === workItems.length - 1) return;

        tl.to(
          item,
          {
            autoAlpha: 0,
            xPercent: -100,
            yPercent: 100,
            rotate: -15,
            scale: 0.8,
            ease: 'power2.inOut',
            duration: 0.95,
          },
          '>'
        );
        tl.to({}, { duration: 1.2 });
      });
    }, pinRef);

    return () => {
      ctx.revert();
    };
  }, [projects]);

  return (
    <section className="works" id="projects">
      <div className="works-header">
        <h2>FEATURED PROJECTS</h2>
      </div>

      <div className="works-pin-scope" ref={pinRef}>
        <div className="works-wrapper" ref={wrapperRef}>
          {projects.length === 0 && (
            <div className="work-item">
              <h3 style={{ color: 'white' }}>Loading Projects...</h3>
            </div>
          )}
          {projects.map((project) => {
          const hasLink = Boolean(project.link && String(project.link).trim());
          const mediaBlock = (
            <>
              <div className="work-media-container">
                {project.mediaType === 'image' && (
                  <img
                    src={resolveMediaUrl(project.mediaPath)}
                    alt={project.title}
                    className="work-media-asset"
                    loading="eager"
                    decoding="async"
                  />
                )}
                {project.mediaType === 'video' && (
                  <video
                    src={resolveMediaUrl(project.mediaPath)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="work-media-asset work-media-asset--video"
                  />
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
                {mediaBlock}
              </a>
            ) : (
              <div key={project.id} className="work-item work-item--static">
                {mediaBlock}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
