import Works from './components/Works';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';

export default function App() {
  return (
    <>
      <CustomCursor />
      <ThemeSwitcher />
      <SmoothScroll>
        <main className="app-main">
          <Hero />
          <Ethos />
          <Hobbies />
          <Works />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
