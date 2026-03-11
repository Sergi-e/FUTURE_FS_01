import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Contact.css';

export default function Contact() {
  const buttonRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const text = textRef.current;

    // Fast setters for 60fps physics
    const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const xTextTo = gsap.quickTo(text, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTextTo = gsap.quickTo(text, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Move button
      xTo(x * 0.4);
      yTo(y * 0.4);
      // Move text further for parallax
      xTextTo(x * 0.2);
      yTextTo(y * 0.2);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      xTextTo(0);
      yTextTo(0);
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <h2 className="contact-title">LET'S CONNECT</h2>
        
        <div className="contact-methods">
          <div className="magnetic-button-wrapper">
            <a ref={buttonRef} href="https://mail.google.com/mail/?view=cm&fs=1&to=ishserge16@gmail.com" target="_blank" rel="noopener noreferrer" className="magnetic-button">
              <span ref={textRef} className="magnetic-text">EMAIL ME</span>
            </a>
          </div>

          <div className="whatsapp-link-container">
            <a href="https://wa.me/250789353600" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
              <span className="wa-icon">WP</span> +250 789353600
            </a>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <div className="footer-left">
          <span>2026 © ALL RIGHTS RESERVED</span>
        </div>
        <div className="footer-right">
          <a href="https://www.linkedin.com/in/ishimwe-serge/" target="_blank" rel="noopener noreferrer" className="cursor-hover">LINKEDIN</a>
          <a href="https://github.com/Sergi-e" target="_blank" rel="noopener noreferrer" className="cursor-hover">GITHUB</a>
        </div>
      </footer>
    </section>
  );
}
