import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import Ethos from './components/Ethos';
import Skills from './components/Skills';
import Works from './components/Works';
import Testimonials from './components/Testimonials';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';

function Portfolio() {
  return (
    <>
      <Navbar />
      <SmoothScroll>
        <main className="app-main">
          <Hero />
          <Ethos />
          <Skills />
          <Works />
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
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
