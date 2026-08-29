import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hero } from './sections/Hero';
import { Outcomes } from './sections/Outcomes';
import { Timeline } from './sections/Timeline';
import { About } from './sections/About';
import { Instructor } from './sections/Instructor';
import { Register } from './sections/Register';
import { Footer } from './components/Footer';
import { Menu } from './components/Menu';
import { SectionDots } from './components/SectionDots';
import { CursorAccents } from './components/CursorAccents';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAssetsReady = useCallback(() => setReady(true), []);

  // The cursor accents' scroll-scramble trigger spans the whole document.
  // Re-measure once the loading screen is gone and layout has settled, so
  // its end point reflects the page's real height rather than a transient
  // pre-load one.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [ready]);

  return (
    <>
      <LoadingScreen visible={!ready} />

      {/* SectionDots derives one dot per direct <section> child of this
          wrapper, so adding a section here is all that is needed for its
          dot to appear - there is no parallel list to update. */}
      <main className="page-sections">
        <Hero ready={ready} onAssetsReady={handleAssetsReady} />
        <Outcomes />
        <Timeline />
        <About />
        <Instructor />
        <Register />
      </main>

      <Footer />
      <Menu open={menuOpen} onOpenChange={setMenuOpen} />
      <SectionDots hidden={menuOpen} />
      {/* <CursorAccents /> */}
    </>
  );
}
