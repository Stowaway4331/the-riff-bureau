import { useEffect, useState } from 'react';

/**
 * Stays up until the hero texture actually reports ready, then fades out.
 * The bar creeps toward 90% while waiting so it never looks frozen.
 */
export function LoadingScreen({ visible }) {
  const [progress, setProgress] = useState(8);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      const id = setTimeout(() => setMounted(false), 450);
      return () => clearTimeout(id);
    }

    const id = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 18));
    }, 220);
    return () => clearInterval(id);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className="loading-screen" data-hidden={!visible}>
      <div className="loading-content">
        <p className="loading-text">The Riff Bureau</p>
        <div className="loading-bar">
          <div className="loading-progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
