import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL, apiSetupHintParagraph } from '../config/api';
import { getJson } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

function ProjectMedia({ project, mediaKind, mediaSrc }) {
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);
  const usePlaceholder = !mediaSrc || failed || mediaKind === 'placeholder';

  const tryPlayVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el || mediaKind !== 'video') return;
    el.muted = true;
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [mediaKind]);

  useEffect(() => {
    if (mediaKind !== 'video' || !mediaSrc) return;
    const el = videoRef.current;
    if (!el) return;

    tryPlayVideo();

    const onVis = () => {
      if (document.visibilityState === 'visible') tryPlayVideo();
    };
    document.addEventListener('visibilitychange', onVis);

    const onCanPlay = () => tryPlayVideo();
    el.addEventListener('loadeddata', onCanPlay);
    el.addEventListener('canplay', onCanPlay);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) tryPlayVideo();
          else el.pause();
        });
      },
      { threshold: 0.08, rootMargin: '40px 0px' }
    );
    io.observe(el);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      el.removeEventListener('loadeddata', onCanPlay);
      el.removeEventListener('canplay', onCanPlay);
      io.disconnect();
    };
  }, [mediaKind, mediaSrc, tryPlayVideo]);

  if (usePlaceholder) {
    return <div className="work-image-placeholder" />;
  }
  if (mediaKind === 'image') {
    return (
      <img
        src={mediaSrc}
        alt={project?.title || 'Project Image'}
        className="work-media-asset"
        onError={() => setFailed(true)}
      />
    );
  }
  if (mediaKind === 'video') {
    return (
      <video
        ref={videoRef}
        key={mediaSrc}
        src={mediaSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="work-media-asset work-media-video"
        onError={() => setFailed(true)}
      />
    );
  }
  return <div className="work-image-placeholder" />;
}

function projectMediaType(project) {
  const raw = project?.mediaType;
  const t = typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
  if (t === 'image' || t === 'video' || t === 'placeholder') return t;
  const p = String(project?.mediaPath ?? '').trim().toLowerCase();
  if (!p) return 'placeholder';
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(p)) return 'video';
  return 'image';
}

export default function Works() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
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
    if (projects.length === 0 || loading) return;

    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      // Desktop Animation: Pinned split screen with parallax vertical wipe
      mm.add("(min-width: 1025px)", () => {
        const steps = gsap.utils.toArray('.works-step-mobile');
        if (steps.length === 0) return;

        const leftItems = gsap.utils.toArray('.works-left-item');
        const rightItems = gsap.utils.toArray('.works-right-item');
        const leftAssets = gsap.utils.toArray('.works-left-item .asset-container');
        const rightContents = gsap.utils.toArray('.works-right-content');

        // Set initial states
        leftItems.forEach((item, i) => {
          if (i !== 0) {
            gsap.set(item, { yPercent: 100 });
            gsap.set(rightItems[i], { autoAlpha: 0 }); // autoAlpha manages opacity & visibility
            gsap.set(rightContents[i], { y: 30, opacity: 0 });
          } else {
            gsap.set(item, { yPercent: 0 });
            gsap.set(rightItems[i], { autoAlpha: 1 });
            gsap.set(rightContents[i], { y: 0, opacity: 1 });
          }
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            // Pin for 100vh per project transition
            end: () => `+=${window.innerHeight * steps.length}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          }
        });

        // Small pause at the beginning so the first project is readable
        tl.to({}, { duration: 0.2 });

        steps.forEach((step, i) => {
          if (i > 0) {
            const transTl = gsap.timeline();

            // 1. Left image container wiping up
            transTl.to(leftItems[i - 1], { yPercent: -100, ease: "none" }, 0);
            transTl.fromTo(leftItems[i], { yPercent: 100 }, { yPercent: 0, ease: "none" }, 0);

            // 2. Subtle internal parallax inside the left container
            if (leftAssets[i - 1]) transTl.to(leftAssets[i - 1], { yPercent: 20, ease: "none" }, 0);
            if (leftAssets[i]) transTl.fromTo(leftAssets[i], { yPercent: -20 }, { yPercent: 0, ease: "none" }, 0);

            // 3. Right panel content transition
            // Outgoing
            transTl.to(rightContents[i - 1], { y: -30, opacity: 0, ease: "power2.inOut" }, 0);
            transTl.set(rightItems[i - 1], { autoAlpha: 0 }, 1); 

            // Incoming
            transTl.set(rightItems[i], { autoAlpha: 1 }, 0);
            transTl.to(rightContents[i], { y: 0, opacity: 1, ease: "power2.inOut" }, 0);

            tl.add(transTl);
          }

          // Pause after each transition to let the user read
          tl.to({}, { duration: 0.5 });
        });
      });

      // Mobile Animation: Simple scroll-triggered fade in
      mm.add("(max-width: 1024px)", () => {
        const steps = gsap.utils.toArray('.works-step-mobile');
        steps.forEach((step) => {
          const content = step.querySelector('.works-right-content');

          if (content) {
            gsap.fromTo(content, 
              { y: 30, opacity: 0 },
              { 
                y: 0, opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                scrollTrigger: {
                  trigger: step,
                  start: "top 70%",
                }
              }
            );
          }
        });
      });

    }, sectionRef);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, [projects, loading]);

  return (
    <section className="works-split" id="projects" ref={sectionRef}>
      <div className="works-split-container" ref={containerRef}>
        
        {loading && projects.length === 0 && (
          <div className="works-empty-state">
            <h3>Loading projects…</h3>
          </div>
        )}

        {!loading && loadError && (
          <div className="works-empty-state">
            <h3>Could not load projects</h3>
            <p>Request URL: <code>{`${API_BASE_URL}/projects`}</code>. {apiSetupHintParagraph()}</p>
          </div>
        )}

        {!loading && !loadError && projects.length === 0 && (
          <div className="works-empty-state">
            <h3>No projects yet</h3>
            <p>
              The API returned an empty list. If you use Render without a persistent disk, add projects again in the admin
              dashboard after each redeploy, or set <code>PORTFOLIO_DB_PATH</code> on a mounted volume.
            </p>
          </div>
        )}

        {projects.map((project, i) => {
          const mediaKind = projectMediaType(project);
          const mediaSrc = resolveMediaUrl(project.mediaPath);
          const hasLink = Boolean(project.link && String(project.link).trim());
          const stepNumber = String(i + 1).padStart(2, '0');

          return (
            <div key={project.id} className="works-step-mobile">
              
              {/* Left Panel: Background Media */}
              <div className="works-left-item">
                <div className="asset-container">
                  <ProjectMedia project={project} mediaKind={mediaKind} mediaSrc={mediaSrc} />
                </div>
              </div>

              {/* Right Panel: Content */}
              <div className="works-right-item">
                <div className="works-right-content">
                  
                  <div className="works-top-bar">
                    <h2 className="works-top-title">{project.title}</h2>
                    <span className="works-top-number">{stepNumber}</span>
                  </div>

                  <div className="works-project-info">
                    <p className="works-project-description">
                      {project.subtitle || 'A featured project in my portfolio.'}
                    </p>
                  </div>

                  {hasLink && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="works-project-link"
                    >
                      (&nbsp;&nbsp;&nbsp;VISIT SITE ↗&nbsp;&nbsp;&nbsp;)
                    </a>
                  )}

                </div>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}