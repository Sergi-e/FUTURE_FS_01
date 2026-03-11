import basketballImg from '../assets/basketball_realistic.png';
import rubiksImg from '../assets/rubiks_cube_realistic.png';
import gamepadImg from '../assets/gamepad_realistic.png';
import './Hobbies.css';

const hobbiesData = [
  { name: 'BASKETBALL', image: basketballImg, desc: 'Precision & Teamwork' },
  { name: 'RUBIK\'S CUBE SOLVING', image: rubiksImg, desc: 'Algorithmic Logic' },
  { name: 'GAMING', image: gamepadImg, desc: 'Immersive Strategy' }
];

export default function Hobbies() {
  return (
    <section className="hobbies" id="hobbies">
      <h2 className="hobbies-title">OFF-THE-CLOCK</h2>
      <div className="hobbies-grid">
        {hobbiesData.map((hobby, index) => (
          <div key={index} className="hobby-card cursor-hover">
            <div className="hobby-icon">
              <img src={hobby.image} alt={hobby.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <h3 className="hobby-name">{hobby.name}</h3>
            <p className="hobby-desc">{hobby.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
