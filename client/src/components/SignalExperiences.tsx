/* Civic Signal Atlas: original React Bits-inspired motion primitives for evidence-led discovery. */
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { MotionStyle, MotionValue } from 'framer-motion';
import Lenis from 'lenis';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Crosshair, Play, Pause } from 'lucide-react';

const signals = [
  { label: 'DUPLICATE WORK', score: '87', color: '#FF5C68', image: '/manus-storage/mplad-project-signals_4d6d81c6.jpg', note: 'Near-identical description found in two districts', meta: 'NASHIK / MH-2024-1187' },
  { label: 'EXECUTION GAP', score: '76', color: '#FF2DAA', image: '/manus-storage/mplad-investigation_3b4bbb25.jpg', note: '95% funds used · 0% physical completion', meta: 'KOTA / RJ-2024-0412' },
  { label: 'VENDOR OUTLIER', score: '63', color: '#B9D7E9', image: '/manus-storage/mplad-hero-field_5e7eeedd.jpg', note: 'Contractor footprint exceeds regional baseline', meta: 'MYSURU / KA-2023-0920' },
  { label: 'GEO MISMATCH', score: '58', color: '#FF8C9A', image: '/manus-storage/mplad-district-texture_d6fee9ee.jpg', note: 'Project coordinates fall outside the reported district', meta: 'SATARA / MH-2024-0763' },
];

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onActiveChange?: (index: number) => void;
};

export type ScrollStackHandle = { scrollToIndex: (index: number) => void };

export const ScrollStackItem = ({ children, itemClassName = '' }: { children: ReactNode; itemClassName?: string }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

export const ScrollStack = forwardRef<ScrollStackHandle, ScrollStackProps>(function ScrollStack({
  children,
  className = '',
  itemDistance = 150,
  itemScale = 0.035,
  itemStackDistance = 34,
  stackPosition = '22%',
  scaleEndPosition = '10%',
  baseScale = 0.78,
  rotationAmount = 2,
  blurAmount = 0,
  onActiveChange,
}, ref) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTransformsRef = useRef(new Map<number, string>());
  const activeIndexRef = useRef(-1);
  const updatingRef = useRef(false);

  const parsePercentage = useCallback((value: string, height: number) => value.includes('%') ? (parseFloat(value) / 100) * height : parseFloat(value), []);
  const getCardTop = useCallback((card: HTMLElement) => card.offsetTop, []);

  const updateCardTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !cardsRef.current.length || updatingRef.current) return;
    updatingRef.current = true;

    const scrollTop = scroller.scrollTop;
    const containerHeight = scroller.clientHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElement = scroller.querySelector('.scroll-stack-end') as HTMLElement | null;
    const endElementTop = endElement?.offsetTop ?? scroller.scrollHeight;

    let topCardIndex = 0;
    cardsRef.current.forEach((card, i) => {
      const triggerStart = getCardTop(card) - stackPositionPx - itemStackDistance * i;
      if (scrollTop >= triggerStart) topCardIndex = i;
    });

    cardsRef.current.forEach((card, i) => {
      const cardTop = getCardTop(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;
      const scaleProgress = Math.max(0, Math.min(1, (scrollTop - triggerStart) / Math.max(1, triggerEnd - triggerStart)));
      const targetScale = Math.min(1, baseScale + i * itemScale);
      const isPreStack = scrollTop < triggerStart;
      const scale = isPreStack ? Math.max(0.86, 1 - i * itemScale * 2.2) : 1 - scaleProgress * (1 - targetScale);
      const rotation = isPreStack ? (i - 1) * rotationAmount : rotationAmount * i * scaleProgress;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      let translateY = 0;
      if (isPreStack) translateY = -i * Math.max(0, card.offsetHeight - itemStackDistance);
      else if (isPinned) translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      else if (scrollTop > pinEnd) translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      const depth = Math.max(0, topCardIndex - i);
      const blur = Math.min(blurAmount * depth, 3);
      const transform = `translate3d(0, ${Math.round(translateY * 100) / 100}px, 0) scale(${Math.round(scale * 1000) / 1000}) rotate(${Math.round(rotation * 100) / 100}deg)`;
      const filter = blur ? `blur(${blur}px)` : 'none';
      const cacheKey = `${transform}|${filter}`;
      if (lastTransformsRef.current.get(i) !== cacheKey) {
        card.style.transform = transform;
        card.style.filter = filter;
        lastTransformsRef.current.set(i, cacheKey);
      }
      card.style.zIndex = String(cardsRef.current.length - i + (i === topCardIndex ? 10 : 0));
    });

    if (topCardIndex !== activeIndexRef.current) {
      activeIndexRef.current = topCardIndex;
      onActiveChange?.(topCardIndex);
    }
    updatingRef.current = false;
  }, [baseScale, blurAmount, getCardTop, itemScale, itemStackDistance, onActiveChange, parsePercentage, rotationAmount, scaleEndPosition, stackPosition]);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => {
      const scroller = scrollerRef.current;
      const card = cardsRef.current[index];
      if (!scroller || !card) return;
      const target = Math.max(0, card.offsetTop - scroller.clientHeight * 0.22);
      scroller.scrollTo({ top: target, behavior: 'smooth' });
    },
  }), []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('.scroll-stack-card'));
    cardsRef.current = cards;
    cards.forEach((card, index) => {
      card.style.marginBottom = index < cards.length - 1 ? `${itemDistance}px` : '0px';
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
    });

    const handleScroll = () => updateCardTransforms();
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchMultiplier: 1.6,
    });
    lenis.on('scroll', handleScroll);
    lenisRef.current = lenis;
    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    updateCardTransforms();

    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      activeIndexRef.current = -1;
    };
  }, [itemDistance, updateCardTransforms]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
});

function SignalScrollCard({ signal, index, active, scrollY, stageTop, onActivate }: { signal: typeof signals[number]; index: number; active: boolean; scrollY: MotionValue<number>; stageTop: number; onActivate: () => void }) {
  const reduceMotion = useReducedMotion();
  const start = stageTop + index * 240;
  const y = useTransform(scrollY, [stageTop, start, start + 80, start + 260, stageTop + 1200], [index * 22, index * 22, index * 6, -150 - index * 20, -250 - index * 24]);
  const scale = useTransform(scrollY, [stageTop, start, start + 80, start + 260, stageTop + 1200], [0.91 - index * 0.025, 0.91 - index * 0.025, 1, 0.92, 0.82]);
  const rotate = useTransform(scrollY, [stageTop, start, start + 80, start + 260, stageTop + 1200], [(index - 1) * 10, (index - 1) * 10, 0, index % 2 ? -6 : 6, index % 2 ? -10 : 10]);
  const opacity = useTransform(scrollY, [stageTop, start, start + 80, start + 360, stageTop + 1200], [index === 0 ? 1 : 0.72, index === 0 ? 1 : 0.72, 1, 0.84, 0.58]);
  const style = { y: reduceMotion ? 0 : y, scale: reduceMotion ? 1 : scale, rotate: reduceMotion ? 0 : rotate, opacity, '--signal': signal.color, zIndex: active ? 20 : signals.length - index } as unknown as MotionStyle;
  return <motion.button className={`signal-card signal-card--continuous ${active ? 'is-active' : ''}`} style={style} onClick={onActivate} aria-label={`Show ${signal.label}`}>
    <img src={signal.image} alt="" /><span className="signal-card__veil" /><span className="signal-card__meta"><small>RISK {signal.score}</small><b>{signal.label}</b><em>{signal.meta}</em></span>
  </motion.button>;
}

export function Hero7Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stageTop, setStageTop] = useState(0);
  const [inView, setInView] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const update = () => setStageTop((stageRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const relative = latest - stageTop;
    const next = Math.max(0, Math.min(signals.length - 1, Math.floor(Math.max(0, relative) / 240)));
    setActive((current) => current === next ? current : next);
  });

  useEffect(() => {
    if (paused || !inView) return;
    const id = window.setInterval(() => {
      const next = (active + 1) % signals.length;
      window.scrollTo({ top: stageTop + next * 240, behavior: 'smooth' });
    }, 4800);
    return () => window.clearInterval(id);
  }, [active, inView, paused, stageTop]);

  return (
    <div className="hero7-stage hero7-scroll-zone" ref={stageRef} aria-label="Scrollable project signal stack">
      <div className="hero7-particles" aria-hidden="true">{Array.from({ length: 26 }).map((_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</div>
      <div className="hero7-orbit orbit-a" /><div className="hero7-orbit orbit-b" />
      {signals.map((signal, index) => <SignalScrollCard key={signal.label} signal={signal} index={index} active={index === active} scrollY={scrollY} stageTop={stageTop} onActivate={() => window.scrollTo({ top: stageTop + index * 240, behavior: 'smooth' })} />)}
      <div className="hero7-caption"><span className="eyebrow">LIVE SIGNAL / {String(active + 1).padStart(2, '0')}</span><strong>{signals[active].note}</strong><button className="icon-button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume automatic scan' : 'Pause automatic scan'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div>
    </div>
  );
}

export function Hero9Reveal() {
  const [active, setActive] = useState(false);
  useEffect(() => { const id = window.requestAnimationFrame(() => setActive(true)); return () => window.cancelAnimationFrame(id); }, []);
  return <section className="hero9-reveal" id="signal-map">
    <img src="/manus-storage/mplad-hero-field_5e7eeedd.jpg" alt="Abstract district signal map" />
    <div className="hero9-scanline" />
    <div className="hero9-copy"><span className="eyebrow">MPLAD SENTINEL / 01</span><h2 className={active ? 'is-revealed' : ''}>Turn public records<br /><em>into review signals.</em></h2><p>A proposed intelligence layer for MPLADS: compare recommendations, sanctions, payments, completion, and agency patterns to show investigators what needs verification.</p><div className="hero-actions"><a href="#signals" className="button-coral cursor-target">Open the signal field <ArrowUpRight size={16} /></a><a href="#how-it-works" className="text-link cursor-target">How detection works <ArrowUpRight size={16} /></a></div></div>
    <motion.div className="hero-console" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .6 }}><div><span className="console-dot" /> SYSTEM ONLINE</div><strong>03,842</strong><small>RECORDS IN REVIEW</small><div className="console-divider" /><strong>04</strong><small>SIGNAL CLASSES</small></motion.div>
    <div className="hero9-footer"><span>SCROLL TO REVEAL</span><ChevronDown size={16} /></div>
  </section>;
}

export function ScrollExpand({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0.15, 0.56], [0.82, 1]); const radius = useTransform(scrollYProgress, [0.15, 0.56], [28, 0]);
  return <div ref={ref} className="scroll-expand-wrap"><motion.div className="scroll-expand-frame" style={{ scale, borderRadius: radius }}>{children}</motion.div></div>;
}

export function TargetCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 }); const [active, setActive] = useState(false);
  useEffect(() => { const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setActive(!!(e.target as HTMLElement)?.closest('.cursor-target')); }; window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move); }, []);
  return <motion.div className={`target-cursor ${active ? 'is-targeting' : ''}`} animate={{ x: pos.x, y: pos.y }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}><Crosshair size={28} strokeWidth={1.2} /><span /></motion.div>;
}
