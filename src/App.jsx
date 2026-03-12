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
import SectionTransitions from './components/SectionTransitions';

export default function App() {
  return (
    <>
      <Navbar />
      <ThemeSwitcher />
      <SmoothScroll>
        <main className="app-main">
          <SectionTransitions>
            <Hero />
            <Ethos />
            <Skills />
            <Works />
            <Testimonials />
            <Hobbies />
            <Contact />
          </SectionTransitions>
        </main>
      </SmoothScroll>
    </>
  );
}
