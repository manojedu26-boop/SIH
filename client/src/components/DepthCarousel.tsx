/* Civic Signal Atlas: a tactile depth rail for evidence cards, adapted from the supplied DepthCarousel interaction. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import gsap from 'gsap';

export type DepthCarouselItem = {
  image: string;
  alt?: string;
  label?: string;
  score?: string;
  meta?: string;
  color?: string;
};

type DepthCarouselProps = {
  items: DepthCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function DepthCarousel({
  items,
  cardWidth = 300,
  cardHeight = 380,
  radius = 0,
  tint = '#05060a',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
}: DepthCarouselProps) {
  const data = useMemo(() => items.filter((item) => item?.image), [items]);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef(1);
  const dragRef = useRef<{ x: number; startPos: number; lastX: number; lastT: number; v: number; moved: boolean; id: number } | null>(null);
  const [active, setActive] = useState(0);
  const configRef = useRef({ cardWidth, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, autoplayDelay, loop });
  configRef.current = { cardWidth, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, duration, autoplayDelay, loop };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const layout = useCallback((position: number) => {
    const config = configRef.current;
    const count = data.length;
    const direction = config.tiltDirection === 'left' ? -1 : 1;
    if (!count) return;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let distance = index - position;
      if (config.loop && count > 1) {
        distance = ((distance % count) + count) % count;
        if (distance > count / 2) distance -= count;
      }
      const behind = Math.max(0, distance);
      const shown = Math.abs(distance) <= config.visibleCards + 0.5;
      const translateZ = -config.depth * distance;
      const translateX = direction * config.spread * distance;
      const rotateY = direction * config.tilt * clamp(distance, 0, 1);
      const opacity = distance < 0 ? Math.max(0, 1 + distance) : shown ? 1 : 0;
      const brightness = Math.max(0.15, 1 - behind * config.falloff);
      const blurPx = config.blur > 0 ? Math.min(config.blur, (behind / Math.max(1, config.visibleCards)) * config.blur) : 0;
      card.style.transform = `translate(-50%, -50%) scale(${scaleRef.current}) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
      const overlay = overlayRefs.current[index];
      if (overlay) overlay.style.opacity = clamp(behind * config.falloff * 1.25, 0, 0.86).toFixed(3);
    });
  }, [data.length]);

  const notify = useCallback((index: number) => {
    setActive(index);
    onChangeRef.current?.(index, data[index]);
  }, [data]);

  const tweenTo = useCallback((target: number, animate = true) => {
    tweenRef.current?.kill();
    const config = configRef.current;
    const proxy = { position: posRef.current };
    tweenRef.current = gsap.to(proxy, {
      position: target,
      duration: animate ? config.duration / 1000 : 0,
      ease: 'power3.out',
      onUpdate: () => {
        posRef.current = proxy.position;
        layout(proxy.position);
      },
      onComplete: () => {
        if (data.length) posRef.current = ((posRef.current % data.length) + data.length) % data.length;
        layout(posRef.current);
      },
    });
  }, [data.length, layout]);

  const setFocus = useCallback((rawIndex: number, animate = true) => {
    const config = configRef.current;
    const count = data.length;
    if (!count) return;
    const index = config.loop ? ((rawIndex % count) + count) % count : clamp(rawIndex, 0, count - 1);
    let delta = index - posRef.current;
    if (config.loop && count > 1) {
      delta = ((delta % count) + count) % count;
      if (delta > count / 2) delta -= count;
    }
    tweenTo(posRef.current + delta, animate);
    if (index !== focusRef.current) {
      focusRef.current = index;
      notify(index);
    }
  }, [data.length, notify, tweenTo]);

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const resize = () => {
      const width = root.getBoundingClientRect().width;
      const needed = cardWidth + Math.abs(spread) * 2 + 120;
      scaleRef.current = clamp(width / needed, 0.4, 1);
      layout(posRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    return () => observer.disconnect();
  }, [cardWidth, layout, spread]);

  useEffect(() => {
    layout(posRef.current);
    return () => { tweenRef.current?.kill(); };
  }, [layout]);

  useEffect(() => {
    if (!autoplay || data.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const interval = window.setInterval(() => { if (!hovered && !focused) navigateBy(1); }, Math.max(autoplayDelay, 600));
    const enter = () => { hovered = true; };
    const leave = () => { hovered = false; };
    const focusIn = () => { focused = true; };
    const focusOut = () => { focused = false; };
    root?.addEventListener('mouseenter', enter);
    root?.addEventListener('mouseleave', leave);
    root?.addEventListener('focusin', focusIn);
    root?.addEventListener('focusout', focusOut);
    return () => {
      window.clearInterval(interval);
      root?.removeEventListener('mouseenter', enter);
      root?.removeEventListener('mouseleave', leave);
      root?.removeEventListener('focusin', focusIn);
      root?.removeEventListener('focusout', focusOut);
    };
  }, [autoplay, autoplayDelay, data.length, navigateBy]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (data.length < 2) return;
      event.preventDefault();
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      posRef.current += clamp(raw / Math.max(cardWidth * 0.9, 1), -0.6, 0.6);
      layout(posRef.current);
      window.clearTimeout((root as HTMLDivElement & { wheelTimer?: number }).wheelTimer);
      (root as HTMLDivElement & { wheelTimer?: number }).wheelTimer = window.setTimeout(() => setFocus(Math.round(posRef.current)), 130);
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [cardWidth, data.length, layout, setFocus]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (data.length < 2) return;
    tweenRef.current?.kill();
    dragRef.current = { x: event.clientX, startPos: posRef.current, lastX: event.clientX, lastT: performance.now(), v: 0, moved: false, id: event.pointerId };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stepPx = Math.max(cardWidth * 0.55 * scaleRef.current, 40);
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; rootRef.current?.setPointerCapture(drag.id); }
    if (!drag.moved) return;
    const now = performance.now();
    drag.v = (event.clientX - drag.lastX) / Math.max(now - drag.lastT, 1);
    drag.lastX = event.clientX;
    drag.lastT = now;
    posRef.current = drag.startPos - dx / stepPx;
    layout(posRef.current);
  };
  const onPointerEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (drag.moved) setFocus(Math.round(posRef.current - (drag.v * 180) / Math.max(cardWidth * 0.55 * scaleRef.current, 40)));
  };

  return <div ref={rootRef} className="depth-carousel" style={{ '--dc-perspective': `${perspective}px`, '--dc-tint': tint } as CSSProperties} role="group" aria-roledescription="carousel" aria-label="MPLADS evidence depth carousel" tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); navigateBy(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); navigateBy(1); } }}>
    <div className="depth-carousel__stage">
      {data.map((item, index) => <div key={`${item.image}-${index}`} ref={(node) => { cardRefs.current[index] = node; }} className={`depth-carousel__card ${active === index ? 'is-active' : ''}`} style={{ width: cardWidth, height: cardHeight, borderRadius: radius, '--card-accent': item.color ?? '#FF5C68' } as CSSProperties} aria-roledescription="slide" aria-label={`${index + 1} of ${data.length}`} aria-hidden={active !== index} onClick={() => setFocus(index)}>
        <img src={item.image} alt={item.alt ?? ''} draggable={false} /><span className="depth-carousel__shade" ref={(node) => { overlayRefs.current[index] = node; }} /><span className="depth-carousel__caption"><small>RISK {item.score ?? '—'}</small><b>{item.label ?? `EVIDENCE ${String(index + 1).padStart(2, '0')}`}</b><em>{item.meta ?? 'MPLADS / REVIEW FIELD'}</em></span>
      </div>)}
    </div>
    {showControls && <div className="depth-carousel__controls"><button type="button" onClick={() => navigateBy(-1)} aria-label="Previous evidence">←</button><button type="button" onClick={() => navigateBy(1)} aria-label="Next evidence">→</button></div>}
    {showIndicators && <div className="depth-carousel__indicators" aria-label="Evidence slides">{data.map((item, index) => <button type="button" key={item.label ?? index} className={active === index ? 'active' : ''} onClick={() => setFocus(index)} aria-label={`Go to evidence ${index + 1}`} />)}</div>}
  </div>;
}
