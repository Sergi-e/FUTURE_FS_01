import Navbar from './components/Navbar';
import ThemeSwitcher from './components/ThemeSwitcher';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import Ethos from './components/Ethos';
import Works from './components/Works';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';

export default function App() {
  return (
    <>
      <Navbar />
      <ThemeSwitcher />
      <SmoothScroll>
        <main className="app-main">
          <Hero />
          <Ethos />
          <Hobbies />
          <Testimonials />
          <Works />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
