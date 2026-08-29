import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hero } from './sections/Hero';
import { Outcomes } from './sections/Outcomes';
import { Timeline } from './sections/Timeline';
import { About } from './sections/About';
import { Instructor } from './sections/Instructor';
import { Footer } from './components/Footer';
import { CursorAccents } from './components/CursorAccents';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [ready, setReady] = useState(false);

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
      <Hero ready={ready} onAssetsReady={handleAssetsReady} />
      <Outcomes />
      <Timeline />
      <About />
      <Instructor />
      <Footer />
      <CursorAccents />
    </>
  );
}
