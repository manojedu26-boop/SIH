/* Civic Signal Atlas: original React Bits-inspired motion primitives for evidence-led discovery. */
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Crosshair, Play, Pause } from 'lucide-react';

const signals = [
  { label: 'DUPLICATE WORK', score: '87', color: '#FF5C68', image: '/manus-storage/mplad-project-signals_4d6d81c6.jpg', note: 'Near-identical description found in two districts' },
  { label: 'EXECUTION GAP', score: '76', color: '#FF2DAA', image: '/manus-storage/mplad-investigation_3b4bbb25.jpg', note: '95% funds used · 0% physical completion' },
  { label: 'VENDOR OUTLIER', score: '63', color: '#B9D7E9', image: '/manus-storage/mplad-hero-field_5e7eeedd.jpg', note: 'Contractor footprint exceeds regional baseline' },
];

export function Hero7Carousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => { setActive((v) => (v + 1) % signals.length); setRotation((v) => v + 120); }, 4200);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <div className="hero7-stage" aria-label="Rotating project signals">
      <div className="hero7-particles" aria-hidden="true">{Array.from({ length: 22 }).map((_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
      <div className="hero7-orbit orbit-a" /><div className="hero7-orbit orbit-b" />
      <motion.div className="hero7-ring" animate={{ rotate: rotation }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
        {signals.map((s, i) => <button key={s.label} className={`signal-card ${i === active ? 'is-active' : ''}`} style={{ '--signal': s.color, '--slot': i } as React.CSSProperties} onClick={() => setActive(i)} aria-label={`Show ${s.label}`}>
          <img src={s.image} alt="" /><span className="signal-card__veil" /><span className="signal-card__meta"><small>RISK {s.score}</small><b>{s.label}</b></span>
        </button>)}
      </motion.div>
      <div className="hero7-core"><img src="/manus-storage/mplad-sentinel-mark_5650636e.png" alt="" /><span>ACTIVE<br/>SCAN</span></div>
      <div className="hero7-caption"><span className="eyebrow">LIVE SIGNAL / 03</span><strong>{signals[active].note}</strong><button className="icon-button" onClick={() => setPaused((v) => !v)} aria-label={paused ? 'Resume carousel' : 'Pause carousel'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div>
    </div>
  );
}

export function Hero9Reveal() {
  const [active, setActive] = useState(false);
  useEffect(() => { const id = window.requestAnimationFrame(() => setActive(true)); return () => window.cancelAnimationFrame(id); }, []);
  return <section className="hero9-reveal" id="signal-map">
    <img src="/manus-storage/mplad-hero-field_5e7eeedd.jpg" alt="Abstract district signal map" />
    <div className="hero9-scanline" />
    <div className="hero9-copy"><span className="eyebrow">MPLAD SENTINEL / 01</span><h2 className={active ? 'is-revealed' : ''}>Find the projects<br /><em>that don’t add up.</em></h2><p>A watchful intelligence layer over public works data — connecting financial, geographic, and execution signals before they become invisible in the aggregate.</p><div className="hero-actions"><a href="#signals" className="button-coral cursor-target">Open the signal field <ArrowUpRight size={16} /></a><a href="#how-it-works" className="text-link cursor-target">How detection works <ArrowUpRight size={16} /></a></div></div>
    <motion.div className="hero-console" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .6 }}><div><span className="console-dot" /> SYSTEM ONLINE</div><strong>03,842</strong><small>RECORDS IN REVIEW</small><div className="console-divider" /><strong>04</strong><small>SIGNAL CLASSES</small></motion.div>
    <div className="hero9-footer"><span>SCROLL TO REVEAL</span><ChevronDown size={16} /></div>
  </section>;
}

export function ScrollExpand({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0.15, 0.56], [0.82, 1]); const radius = useTransform(scrollYProgress, [0.15, 0.56], [28, 0]);
  return <div ref={ref} className="scroll-expand-wrap"><motion.div className="scroll-expand-frame" style={{ scale, borderRadius: radius }}>{children}</motion.div></div>;
}

export function TargetCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 }); const [active, setActive] = useState(false);
  useEffect(() => { const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setActive(!!(e.target as HTMLElement)?.closest('.cursor-target')); }; window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move); }, []);
  return <motion.div className={`target-cursor ${active ? 'is-targeting' : ''}`} animate={{ x: pos.x, y: pos.y }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}><Crosshair size={28} strokeWidth={1.2} /><span /></motion.div>;
}
