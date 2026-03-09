import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    
    // QuickSetter for extreme GSAP performance (prevents layout thrashing)
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" }),
          yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

    const moveCursor = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    if (isHovering) {
      gsap.to(cursorRef.current, {
        scale: 3,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        border: '1px solid var(--accent-neon)',
        mixBlendMode: 'normal',
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(cursorRef.current, {
        scale: 1,
        backgroundColor: 'var(--text-primary)',
        border: 'none',
        mixBlendMode: 'difference',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [isHovering]);

  return <div className="custom-cursor" ref={cursorRef} />;
}
