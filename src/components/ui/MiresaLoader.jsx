import { useEffect, useState } from 'react';
import DoodleCrewFooter from './DoodleCrewFooter';

export default function MiresaLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setVisible(false), 3800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return <div className="miresa-loader" role="status" aria-label="Загрузка miresa VPN">
      <DoodleCrewFooter
        wordmark="MIRESA"
        brand=""
        blurb=""
        tagline="Интернет в твоём ритме"
        columns={[]}
        actions={[]}
        crew={[
          { kind: 'cat', letter: 0, seat: 'front', offset: -0.34, name: 'Сакура' },
          { kind: 'bird', letter: 1, seat: 'top', offset: 0.02, name: 'Пип' },
          { kind: 'mushroom', letter: 2, seat: 'front', offset: 0.08, name: 'Мори', scale: 0.95 },
          { kind: 'kid', letter: 3, seat: 'top', offset: -0.05, name: 'Мико' },
          { kind: 'ghost', letter: 4, seat: 'behind', offset: 0, name: 'Юки' },
          { kind: 'cat', letter: 5, seat: 'front', offset: 0.38, flip: true, name: 'Моти' },
        ]}
        doodles={['heart', 'star', 'sparkle', 'plane']}
        doodleCount={5}
        backToTop={false}
        copyright=""
        legal={[]}
        socials={[]}
        interactive={false}
        palette={{ background: '#F8F6F0', ink: '#252923', accent: '#A8B99A' }}
        height="min(680px, 86vh)"
        className="miresa-loader__scene"
      />
  </div>;
}
