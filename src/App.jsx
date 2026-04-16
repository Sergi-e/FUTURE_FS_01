import { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import ApproachMorphLayer from './components/ApproachMorphLayer';
import Ethos from './components/Ethos';
import Skills from './components/Skills';
import Works from './components/Works';
import Testimonials from './components/Testimonials';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';

function Portfolio() {
  const approachSlotRef = useRef(null);

  return (
    <>
      <Navbar />
      <SmoothScroll>
        <main className="app-main">
          <Hero approachSlotRef={approachSlotRef} />
          <ApproachMorphLayer slotRef={approachSlotRef} />
          <Ethos />
          <Works />
          <Skills />
          <Testimonials />
          <Hobbies />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
