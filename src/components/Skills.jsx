import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Skills.css';

gsap.registerPlugin(ScrollTrigger);

const SIMPLE_ICONS_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons';

const skillCategories = [
  'DEVELOPMENT',
  'BACKEND, AI & DATA',
  'MOTION & UI',
  'GEOSPATIAL'
];

const techStack = [
  { name: 'HTML5', role: 'Structure & Markup', color: '#E34F26', slug: 'html5' },
  { name: 'CSS3', role: 'Style Orchestrator', color: '#1572B6', slug: 'css3' },
  { name: 'JAVASCRIPT', role: 'Interactivity Engine', color: '#F7DF1E', slug: 'javascript' },
  { name: 'REACT', role: 'UI Ecosystem', color: '#61DAFB', slug: 'react' },
  { name: 'NODE.JS', role: 'API Backbone', color: '#339933', slug: 'nodedotjs' },
  { name: 'PYTHON', role: 'AI Research Lab', color: '#3776AB', slug: 'python' },
  { name: 'POSTGRESQL', role: 'Enterprise Logic', color: '#336791', slug: 'postgresql' },
  { name: 'MONGODB', role: 'Document Store', color: '#47A248', slug: 'mongodb' },
  { name: 'GIT', role: 'Version Control', color: '#F05032', slug: 'git' },
  { name: 'GSAP', role: 'Motion Engine', color: '#88CE02', slug: 'greensock' }
];

export default function Skills() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const marquee = marqueeRef.current;
      const marqueeWrapper = marquee?.querySelector('.tech-marquee-wrapper');
      if (!marqueeWrapper) return;

      // Infinite Seamless Revolution
      gsap.to(marqueeWrapper, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: 'none'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const iconUrl = (slug) => `${SIMPLE_ICONS_BASE}/${slug}.svg`;

  return (
    <section className="skills" id="skills" ref={sectionRef}>
      <div className="skills-container">
        <header className="skills-header">
          <span className="skills-tag">EXPERTISE & TOOLS</span>
          <h2 className="skills-title">TECHNICAL TOOLS I USE</h2>
        </header>

        {/* Seamless Circular Marquee */}
        <div className="tech-ecosystem">
          <div className="tech-marquee" ref={marqueeRef}>
            <div className="tech-marquee-wrapper">
              {/* Primary Set */}
              <div className="tech-marquee-content">
                {techStack.map((tech, i) => (
                  <div className="tech-pill" key={i}>
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
                ))}
              </div>
              {/* Duplicate Set for Seamless Loop */}
              <div className="tech-marquee-content">
                {techStack.map((tech, i) => (
                  <div className="tech-pill" key={`clone-${i}`}>
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
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="experience-card">
          <div className="exp-left">
            <h3 className="exp-number">1 Year</h3>
            <p className="exp-description">Of Development Experience</p>
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

        <div className="skills-grid" ref={gridRef}>
          {skillCategories.map((category, index) => (
            <div className="skill-card" key={index}>
              <h3 className="skill-category">{category}</h3>
              <div className="skill-card-bg"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
