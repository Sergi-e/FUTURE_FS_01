import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL, apiSetupHintParagraph } from '../config/api';
import { getJson } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

function openProjectInNewTab(url) {
  const href = String(url || '').trim();
  if (!href) return;
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function ProjectMedia({ project, mediaKind, mediaSrc }) {
  const [failed, setFailed] = useState(false);
  const usePlaceholder = !mediaSrc || failed || mediaKind === 'placeholder';

  if (usePlaceholder) {
    return <div className="work-image-placeholder" />;
  }
  if (mediaKind === 'image') {
    return (
      <img
        src={mediaSrc}
        alt={project.title}
        className="work-media-asset"
        onError={() => setFailed(true)}
      />
    );
  }
  if (mediaKind === 'video') {
    return (
      <video
        src={mediaSrc}
        autoPlay
        muted
        loop
        playsInline
        className="work-media-asset"
        onError={() => setFailed(true)}
      />
    );
  }
  return <div className="work-image-placeholder" />;
}

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getJson('/projects')
      .then((data) => {
        if (cancelled) return;
        setLoadError(null);
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch projects', `${API_BASE_URL}/projects`, err);
        setProjects([]);
        setLoadError(err.message || 'Request failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        {loading && projects.length === 0 && (
          <div className="work-item">
            <h3 style={{ color: 'white' }}>Loading projects…</h3>
          </div>
        )}
        {!loading && loadError && (
          <div className="work-item">
            <h3 style={{ color: 'white' }}>Could not load projects</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Request URL: <code style={{ color: 'inherit' }}>{`${API_BASE_URL}/projects`}</code>. {apiSetupHintParagraph()}
            </p>
          </div>
        )}
        {!loading && !loadError && projects.length === 0 && (
          <div className="work-item">
            <h3 style={{ color: 'white' }}>No projects yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              The API returned an empty list. If you use Render without a persistent disk, add projects again in the admin
              dashboard after each redeploy, or set <code style={{ color: 'inherit' }}>PORTFOLIO_DB_PATH</code> on a
              mounted volume.
            </p>
          </div>
        )}
        {projects.map((project) => {
          const hasLink = Boolean(project.link && String(project.link).trim());
          const mediaKind = projectMediaType(project);
          const mediaSrc = resolveMediaUrl(project.mediaPath);
          const cardBody = (
            <>
              <div className="work-media-container cursor-hover">
                <ProjectMedia key={project.id} project={project} mediaKind={mediaKind} mediaSrc={mediaSrc} />
                <div className="work-overlay"></div>
              </div>
              <div className="work-meta">
                <h3>{project.title}</h3>
                <div className="work-details">
                  <span>{project.subtitle}</span>
                  <span>{project.year}</span>
                </div>
              </div>
            </>
          );

          return hasLink ? (
            <div key={project.id} className="work-item">
              <a
                className="work-item-card-link"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open project: ${project.title}`}
              >
                {cardBody}
              </a>
              <button
                type="button"
                className="work-view-more"
                aria-label={`View more: ${project.title}`}
                onClick={() => openProjectInNewTab(project.link)}
              >
                VIEW MORE →
              </button>
            </div>
          ) : (
            <div key={project.id} className="work-item work-item--static">
              {cardBody}
              <span className="work-view-more work-view-more--static" aria-hidden="true">
                VIEW MORE →
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
