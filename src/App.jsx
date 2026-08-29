import { useCallback, useState } from 'react';
import { Hero } from './sections/Hero';
import { Outcomes } from './sections/Outcomes';
import { Footer } from './components/Footer';
import { CursorAccents } from './components/CursorAccents';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [ready, setReady] = useState(false);

  const handleAssetsReady = useCallback(() => setReady(true), []);

  return (
    <>
      <LoadingScreen visible={!ready} />
      <Hero ready={ready} onAssetsReady={handleAssetsReady} />
      <Outcomes />
      <Footer />
      <CursorAccents />
    </>
  );
}
