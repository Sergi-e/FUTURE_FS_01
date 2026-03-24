import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Skills.css';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { category: "DEVELOPMENT", items: ["React.js", "Node.js", "JavaScript", "HTML5 / CSS3"] },
  { category: "BACKEND, AI & DATA", items: ["Python", "Machine Learning", "Data Analysis", "SQL / MongoDB"] },
  { category: "MOTION & UI", items: ["GSAP", "Framer Motion", "UI/UX Design", "Responsive Architecture"] },
  { category: "GEOSPATIAL", items: ["ArcGIS", "Spatial Data", "Mapping Solutions", "Geoprocessing"] }
];

const techStack = [
  { name: "C++", role: "Structure Architect", color: "#E34F26", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg> },
  { name: "CSS", role: "Style Orchestrator", color: "#1572B6", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm5.09 4.413L5.41 3.12l13.178.002-.232 2.622L8.53 5.741l.233 2.622h10.06l-.234 2.622h-10.06l.233 2.622h7.622L16.038 17.031l-4.038 1.115-4.04-1.115-.258-2.93H4.805l.405 4.604L12 20.938l6.79-1.874.654-7.443H8.531z"/></svg> },
  { name: "JAVASCRIPT", role: "Interactivity Engine", color: "#F7DF1E", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0zm22.034 18.268c0-2.417-1.469-3.414-3.469-4.288-1.469-.64-2.126-1.025-2.126-1.954 0-.847.669-1.411 1.696-1.411 1.055 0 1.696.46 2.053 1.25l2.443-1.411c-.751-1.316-1.879-2.35-4.514-2.35-2.469 0-4.135 1.549-4.135 3.947 0 2.53 1.481 3.488 3.84 4.514 1.411.603 1.758 1.025 1.758 1.879 0 1.055-.847 1.549-1.974 1.549-1.22 0-2.107-.565-2.67-1.636l-2.431 1.344c.83 1.636 2.531 2.801 5.048 2.801 3.14 0 4.944-1.783 4.944-4.234zm-9.333-8.268H9.86v7.352c0 1.644-.069 2.126-.847 2.126-.46 0-.817-.189-.968-.696l-2.443 1.411c.441 1.287 1.469 1.954 3.324 1.954 2.583 0 3.325-1.549 3.325-4.254V10z"/></svg> },
  { name: "REACT.js", role: "UI Ecosystem", color: "#61DAFB", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.08c0-1.4-.41-2.61-1.1-3.49C22 6.46 20.5 5.5 18.6 4.95c.29-.98.4-1.93.3-2.8-.13-.93-.56-1.67-1.33-2.15C13.43-.16 12 1.23 11 1.23c-1 0-2.43-1.39-6.57-1.23-.77.48-1.2 1.22-1.33 2.15-.1.87.01 1.82.3 2.8C1.5 5.5 0 6.46.1 7.59 0 8.47.41 9.68 1.1 10.56a5.61 5.61 0 00-.3 2.8c0 1.4.41 2.61 1.1 3.49C2 17.54 3.5 18.5 5.4 19.05c-.29.98-.4 1.93-.3 2.8.13.93.56 1.67 1.33 2.15 4.14.16 5.57-1.23 6.57-1.23s2.43 1.39 6.57 1.23c.77-.48 1.2-1.22 1.33-2.15.1-.87-.01-1.82-.3-2.8 1.9-.55 3.4-1.51 4.3-2.64.69-.88 1.1-2.09 1.1-2.97a5.61 5.61 0 00-.3-2.8zM12 14a2 2 0 110-4 2 2 0 010 4z"/></svg> },
  { name: "NODE.js", role: "API Backbone", color: "#339933", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l-10.392 6v12l10.392 6 10.392-6v-12l-10.392-6zm.052 14.538c-1.334 0-2.415-1.082-2.415-2.415 0-1.333 1.081-2.414 2.415-2.414 1.333 0 2.414 1.081 2.414 2.414.001 1.333-1.08 2.415-2.414 2.415z"/></svg> },
  { name: "POSTGRESQL", role: "Enterprise Logic", color: "#336791", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg> },
  { name: "PYTHON", role: "AI Research Lab", color: "#3776AB", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.81-.13.72-.2.63-.26.55-.32.48-.38.4-.44.32-.5.24-.54.17-.58.1-.62.03h-1.03l-.4.04-.37.08-.33.12-.3.16-.25.19-.22.22-.17.26-.14.3-.1.34-.06.38-.04.43v1.08l.02.2.04.26.1.3.16.33.25.34.34.34.45.32.59.3.73.26.9.2.18.01h1.05l.44-.02.43-.05.4-.1.38-.13.34-.18.3-.23.23-.28.18-.33.12-.38.05-.44V15h2.44l.02.44-.02.45-.06.43-.1.41-.14.37-.2.33-.25.28-.3.23-.36.17-.41.1-.45.05h-4.27l-.41-.02-.42-.06-.41-.1-.38-.14-.35-.19-.3-.24-.26-.29-.22-.34-.17-.38-.12-.43-.07-.47-.02-.52V4.73l.02-.46.07-.44.11-.42.17-.38.21-.34.27-.3.33-.25.37-.2.42-.14.45-.07.49-.03h5.34c.22 0 .44.01.66.03zm-2.25 10a1 1 0 100-2 1 1 0 000 2z"/></svg> },
  { name: "TYPESCRIPT", role: "Type Safety", color: "#3178C6", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zM12.9 17.61c-1.34 0-2.31-.35-2.88-1.05l1.09-1.5c.34.45.92.83 1.77.83 1.05 0 1.5-.47 1.5-1.07 0-.74-.75-.95-2.22-1.42-2.1-.67-3.13-1.6-3.13-3.05 0-1.72 1.34-3.09 3.51-3.09 1.45 0 2.44.38 3 1.03l-1.08 1.49c-.43-.44-.92-.73-1.68-.73-.91 0-1.4.45-1.4 1.04 0 .7.65.91 2.05 1.35 2.16.65 3.32 1.57 3.32 3.12 0 1.83-1.43 3.03-3.83 3.03zM5.38 22.83H2.88v-8.31H.56v-2.38h7.32v2.38H5.38v8.31z"/></svg> }
];

export default function Skills() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const marquee = marqueeRef.current;
      const marqueeWrapper = marquee.querySelector('.tech-marquee-wrapper');
      
      // Infinite Seamless Revolution
      gsap.to(marqueeWrapper, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: "none"
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

        {/* Seamless Circular Marquee */}
        <div className="tech-ecosystem">
          <div className="tech-marquee" ref={marqueeRef}>
            <div className="tech-marquee-wrapper">
              {/* Primary Set */}
              <div className="tech-marquee-content">
                {techStack.map((tech, i) => (
                  <div className="tech-pill" key={i}>
                    <div className="tech-icon-circle" style={{ color: tech.color }}>
                      {tech.icon}
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
                      {tech.icon}
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
          {skills.map((skill, index) => (
            <div className="skill-card" key={index}>
              <h3 className="skill-category">{skill.category}</h3>
              <ul className="skill-items">
                {skill.items.map((item, i) => (
                  <li key={i} className="skill-item">{item}</li>
                ))}
              </ul>
              <div className="skill-card-bg"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
