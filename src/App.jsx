import Navbar from './components/Navbar';
import ThemeSwitcher from './components/ThemeSwitcher';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import Ethos from './components/Ethos';
import Skills from './components/Skills';
import Works from './components/Works';
import Testimonials from './components/Testimonials';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';

export default function App() {
  return (
    <>
      <Navbar />
      <ThemeSwitcher />
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
