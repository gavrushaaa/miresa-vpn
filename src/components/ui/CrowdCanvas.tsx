import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

type RGB = readonly [number, number, number];

interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Peep {
  frame: SpriteFrame;
  depth: number;
  direction: 1 | -1;
  speed: number;
  phase: number;
  bob: number;
  x: number;
  width: number;
  height: number;
  anchorY: number;
}

interface CrowdCanvasProps {
  src: string;
  rows?: number;
  cols?: number;
  className?: string;
}

const INK: RGB = [37, 35, 45];
const TONES: Record<string, RGB> = {
  milk: [255, 249, 247],
  cream: [248, 237, 229],
  rose: [245, 156, 176],
  sage: [237, 242, 229],
};

function toneForFrame(index: number): RGB {
  if (index % 11 === 0 || index % 11 === 6) return TONES.rose;
  if (index % 8 === 3) return TONES.sage;
  if (index % 4 === 1) return TONES.cream;
  return TONES.milk;
}

function createColorizedSheet(image: HTMLImageElement, rows: number, columns: number): HTMLCanvasElement | null {
  const qualityScale = 0.5;
  const sheet = document.createElement('canvas');
  sheet.width = Math.floor((image.naturalWidth * qualityScale) / columns) * columns;
  sheet.height = Math.floor((image.naturalHeight * qualityScale) / rows) * rows;
  const context = sheet.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, sheet.width, sheet.height);
  const imageData = context.getImageData(0, 0, sheet.width, sheet.height);
  const { data, width, height } = imageData;
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  for (let y = 0; y < height; y += 1) {
    const row = Math.min(rows - 1, Math.floor(y / cellHeight));
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4;
      if (data[pixel + 3] === 0) continue;

      const column = Math.min(columns - 1, Math.floor(x / cellWidth));
      const tone = toneForFrame(row * columns + column);
      const luminance = (0.2126 * data[pixel] + 0.7152 * data[pixel + 1] + 0.0722 * data[pixel + 2]) / 255;

      data[pixel] = Math.round(INK[0] + (tone[0] - INK[0]) * luminance);
      data[pixel + 1] = Math.round(INK[1] + (tone[1] - INK[1]) * luminance);
      data[pixel + 2] = Math.round(INK[2] + (tone[2] - INK[2]) * luminance);
    }
  }

  context.putImageData(imageData, 0, 0);
  return sheet;
}

function crowdSize(width: number): number {
  if (width < 640) return Math.max(18, Math.round(width / 15));
  return Math.min(72, Math.max(32, Math.round(width / 23)));
}

function scaleForDepth(depth: number, width: number): number {
  const min = width < 640 ? 0.18 : 0.24;
  const max = width < 640 ? 0.34 : 0.56;
  return min + depth * (max - min);
}

export default function CrowdCanvas({ src, rows = 7, cols = 15, className = '' }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assetError, setAssetError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) {
      setAssetError(true);
      return undefined;
    }

    let disposed = false;
    let loaded = false;
    let tickerAttached = false;
    let colorizedSheet: HTMLCanvasElement | null = null;
    let frames: SpriteFrame[] = [];
    let crowd: Peep[] = [];
    const stage = { width: 0, height: 0 };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let image: HTMLImageElement | null = new Image();

    const draw = () => {
      const spriteSheet = colorizedSheet;
      if (!loaded || !spriteSheet || !stage.width || !stage.height) return;
      context.clearRect(0, 0, stage.width, stage.height);

      crowd.forEach((peep) => {
        const y = peep.anchorY + Math.sin(peep.phase) * peep.bob;
        context.save();
        if (peep.direction < 0) {
          context.translate(peep.x + peep.width, y);
          context.scale(-1, 1);
        } else {
          context.translate(peep.x, y);
        }
        context.drawImage(
          spriteSheet,
          peep.frame.x,
          peep.frame.y,
          peep.frame.width,
          peep.frame.height,
          0,
          0,
          peep.width,
          peep.height,
        );
        context.restore();
      });
    };

    const placePeep = (peep: Peep) => {
      const scale = scaleForDepth(peep.depth, stage.width);
      peep.width = peep.frame.width * scale;
      peep.height = peep.frame.height * scale;
      peep.anchorY = stage.height * (0.55 + peep.depth * 0.41) - peep.height;
      peep.bob = 1.5 + peep.depth * 2.2;
    };

    const makePeep = (frame: SpriteFrame): Peep => {
      const depth = Math.random();
      const peep: Peep = {
        frame,
        depth,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 23 + Math.random() * 38,
        phase: Math.random() * Math.PI * 2,
        bob: 2,
        x: Math.random() * stage.width,
        width: 0,
        height: 0,
        anchorY: 0,
      };
      placePeep(peep);
      return peep;
    };

    const syncCrowd = () => {
      const target = crowdSize(stage.width);
      while (crowd.length > target) crowd.pop();
      while (crowd.length < target && frames.length) {
        crowd.push(makePeep(frames[Math.floor(Math.random() * frames.length)]));
      }
      crowd.sort((a, b) => a.depth - b.depth);
    };

    const tick = (_time: number, deltaTime: number) => {
      if (!loaded || document.hidden || motionQuery.matches) return;
      const delta = Math.min(deltaTime, 48) / 1000;
      crowd.forEach((peep) => {
        peep.x += peep.direction * peep.speed * delta;
        peep.phase += delta * (1.2 + peep.depth * 0.45);
        if (peep.direction > 0 && peep.x > stage.width + peep.width) peep.x = -peep.width;
        if (peep.direction < 0 && peep.x < -peep.width) peep.x = stage.width;
      });
      draw();
    };

    const syncTicker = () => {
      if (!loaded || !stage.width || !stage.height) return;
      if (motionQuery.matches && tickerAttached) {
        gsap.ticker.remove(tick);
        tickerAttached = false;
      } else if (!motionQuery.matches && !tickerAttached) {
        gsap.ticker.add(tick);
        tickerAttached = true;
      }
      draw();
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const oldWidth = stage.width;
      const oldHeight = stage.height;
      stage.width = bounds.width;
      stage.height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stage.width * pixelRatio);
      canvas.height = Math.round(stage.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (loaded) {
        crowd.forEach((peep) => {
          if (oldWidth && oldHeight) peep.x = (peep.x / oldWidth) * stage.width;
          placePeep(peep);
        });
        syncCrowd();
        syncTicker();
      }
    };

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener('resize', resize);
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', syncTicker);
    else motionQuery.addListener(syncTicker);
    resize();

    const sourceImage = image;
    sourceImage.onload = () => {
      sourceImage.onload = null;
      sourceImage.onerror = null;
      if (disposed) {
        image = null;
        return;
      }
      try {
        colorizedSheet = createColorizedSheet(sourceImage, rows, cols);
        if (!colorizedSheet) throw new Error('Не удалось создать цветной спрайт-лист.');
        const frameWidth = colorizedSheet.width / cols;
        const frameHeight = colorizedSheet.height / rows;
        frames = Array.from({ length: rows * cols }, (_, index) => ({
          x: (index % cols) * frameWidth,
          y: Math.floor(index / cols) * frameHeight,
          width: frameWidth,
          height: frameHeight,
        }));
        loaded = true;
        setAssetError(false);
        crowd.forEach(placePeep);
        syncCrowd();
        syncTicker();
      } catch {
        setAssetError(true);
      }
      image = null;
    };
    sourceImage.onerror = () => {
      sourceImage.onload = null;
      sourceImage.onerror = null;
      if (!disposed) setAssetError(true);
      image = null;
    };
    sourceImage.src = src;

    return () => {
      disposed = true;
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
      image = null;
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', syncTicker);
      else motionQuery.removeListener(syncTicker);
      if (tickerAttached) gsap.ticker.remove(tick);
      colorizedSheet = null;
      frames = [];
      crowd = [];
    };
  }, [src, rows, cols]);

  return <>
    <canvas
      ref={canvasRef}
      className={`aisa-crowd-canvas ${className}`}
      role="img"
      aria-label="Декоративная сцена с движущимися иллюстрациями людей"
    />
    {assetError && <span className="aisa-crowd-canvas-error" role="status">Иллюстрация временно недоступна</span>}
  </>;
}
