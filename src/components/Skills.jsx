import React, { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Skills.css';

const SIMPLE_ICONS_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons';

const skillTrees = [
  {
    id: 'fe',
    label: 'FRONT END',
    tech: [
      { name: 'HTML5', role: 'Structure & Markup', color: '#E34F26', slug: 'html5' },
      { name: 'CSS3', role: 'Style Orchestrator', color: '#1572B6', slug: 'css3' },
      { name: 'JAVASCRIPT', role: 'Interactivity Engine', color: '#F7DF1E', slug: 'javascript' },
      { name: 'REACT', role: 'UI Ecosystem', color: '#61DAFB', slug: 'react' }
    ]
  },
  {
    id: 'be',
    label: 'BACKEND, AI & DATA',
    tech: [
      { name: 'NODE.JS', role: 'API Backbone', color: '#339933', slug: 'nodedotjs' },
      { name: 'PYTHON', role: 'AI Research Lab', color: '#3776AB', slug: 'python' },
      { name: 'POSTGRESQL', role: 'Enterprise Logic', color: '#336791', slug: 'postgresql' },
      { name: 'MONGODB', role: 'Document Store', color: '#47A248', slug: 'mongodb' },
      { name: 'GIT', role: 'Version Control', color: '#F05032', slug: 'git' }
    ]
  },
  {
    id: 'motion',
    label: 'MOTION & UI',
    tech: [{ name: 'GSAP', role: 'Motion Engine', color: '#88CE02', slug: 'greensock' }]
  },
  {
    id: 'geo',
    label: 'GEOSPATIAL',
    tech: [
      { name: 'MAPBOX', role: 'Maps & Geodata', color: '#000000', slug: 'mapbox' },
      { name: 'LEAFLET', role: 'Web Maps', color: '#199900', slug: 'leaflet' },
      { name: 'ARCGIS', role: 'GIS & Spatial Analysis', color: '#0079C1', slug: 'arcgis' }
    ]
  }
];

function TechPill({ tech, iconUrl }) {
  return (
    <div className="tech-pill">
      <div className="tech-icon-circle" style={{ color: tech.color }}>
        <span
          className="tech-simple-icon"
          style={{
            backgroundColor: tech.color,
            WebkitMaskImage: `url(${iconUrl(tech.slug)})`,
            maskImage: `url(${iconUrl(tech.slug)})`
          }}
          aria-hidden
        />
      </div>
      <span className="tech-name-label">{tech.name}</span>
      <div className="tech-role-info">
        <span className="tech-role-tag">{tech.role}</span>
      </div>
    </div>
  );
}

function SkillTreeColumn({ tree, iconUrl }) {
  const single = tree.tech.length === 1;

  return (
    <div className="skill-tree-col">
      <div className="skill-tree-head">
        <h3 className="skill-category skill-tree-category">{tree.label}</h3>
      </div>
      <div
        className={`skill-tree-connector${single ? ' skill-tree-connector--single' : ''}`}
        aria-hidden
      >
        <span className="st-trunk-v" />
        {!single && <span className="st-trunk-h" />}
        <div className="st-branches">
          {tree.tech.map((tech, i) => (
            <div className="st-branch" key={`${tree.id}-${tech.slug}-${i}`}>
              {!single && <span className="st-drop" />}
              <TechPill tech={tech} iconUrl={iconUrl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeSegment({ iconUrl }) {
  return (
    <div className="tech-marquee-segment">
      {skillTrees.map((tree) => (
        <SkillTreeColumn key={tree.id} tree={tree} iconUrl={iconUrl} />
      ))}
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const iconUrl = useCallback((slug) => `${SIMPLE_ICONS_BASE}/${slug}.svg`, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const inner = innerRef.current;
    if (!inner || reduce) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(inner, {
        xPercent: -50,
        repeat: -1,
        duration: 55,
        ease: 'none'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="skills" id="skills" ref={sectionRef}>
      <div className="skills-container">
        <header className="skills-header">
          <span className="skills-tag">EXPERTISE & TOOLS</span>
          <h2 className="skills-title">TECHNICAL TOOLS I USE</h2>
        </header>

        <div className="tech-ecosystem">
          <div className="tech-marquee" aria-label="Technical skills by category">
            <div className="tech-marquee-inner" ref={innerRef}>
              <MarqueeSegment iconUrl={iconUrl} />
              <MarqueeSegment iconUrl={iconUrl} />
            </div>
          </div>
        </div>

        <div className="experience-card">
          <div className="exp-left">
            <h3 className="exp-number">1 Year</h3>
            <p className="exp-description">of dvpt experience</p>
          </div>
          <div className="exp-middle">
            <div className="exp-visual-box flower">
              <div className="flower-shape-layer s1"></div>
              <div className="flower-shape-layer s2"></div>
              <div className="exp-text-center">C2C</div>
            </div>
          </div>
          <div className="exp-right">
            <div className="exp-visual-box simple">
              <div className="exp-glow-layer"></div>
              <div className="exp-text-center small">1+ YR</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
