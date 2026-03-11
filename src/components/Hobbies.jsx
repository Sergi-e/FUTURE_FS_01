import React from 'react';
import './Hobbies.css';

const hobbiesData = [
  { name: 'BASKETBALL', icon: '🏀', desc: 'Precision & Teamwork' },
  { name: 'RUBIK\'S CUBE SOLVING', icon: '🧩', desc: 'Algorithmic Logic' },
  { name: 'GAMING', icon: '🎮', desc: 'Immersive Strategy' }
];

export default function Hobbies() {
  return (
    <section className="hobbies" id="hobbies">
      <h2 className="hobbies-title">OFF-THE-CLOCK</h2>
      <div className="hobbies-grid">
        {hobbiesData.map((hobby, index) => (
          <div key={index} className="hobby-card">
            <span className="hobby-icon">{hobby.icon}</span>
            <h3 className="hobby-name">{hobby.name}</h3>
            <p className="hobby-desc">{hobby.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
