/* Civic Signal Atlas: restrained text motion for factual, evidence-led reading beats. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from 'framer-motion';

export function SplitFlapText({ words, className = '' }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setIndex((value) => (value + 1) % words.length), 2600); return () => window.clearInterval(id); }, [words.length]);
  return <span className={`split-flap-lite ${className}`.trim()} aria-label={words[index]}><AnimatePresence mode="wait" initial={false}><motion.span key={words[index]} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .24 }}>{words[index]}</motion.span></AnimatePresence></span>;
}

export function FoldText({ children, className = '' }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .4 });
  const segments = useMemo(() => Array.from(children), [children]);
  return <span ref={ref} className={`fold-text-lite ${inView ? 'is-folded' : ''} ${className}`.trim()} aria-label={children}>{segments.map((char, index) => <span key={`${char}-${index}`} style={{ '--fold-delay': `${index * 0.035}s` } as React.CSSProperties}>{char === ' ' ? '\u00a0' : char}</span>)}</span>;
}

export function RotatingText({ texts, className = '' }: { texts: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setIndex((value) => (value + 1) % texts.length), 2200); return () => window.clearInterval(id); }, [texts.length]);
  return <span className={`rotating-text-lite ${className}`.trim()}><AnimatePresence mode="wait" initial={false}><motion.span key={texts[index]} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: .3, ease: [.23, 1, .32, 1] }}>{texts[index]}</motion.span></AnimatePresence></span>;
}

export function CountUpText({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .5 });
  const value = useMotionValue(0);
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState('0');
  useEffect(() => { if (inView) value.set(to); }, [inView, to, value]);
  useEffect(() => spring.on('change', (latest) => setDisplay(Math.round(latest).toLocaleString('en-IN'))), [spring]);
  return <span ref={ref} className={className}>{display}{suffix}</span>;
}

export function ScrambleLine({ children, className = '' }: { children: string; className?: string }) {
  const [text, setText] = useState(children);
  const chars = '.:01/—';
  const scramble = () => { let frame = 0; const total = children.length * 2; const id = window.setInterval(() => { frame += 1; setText(children.split('').map((char, index) => index < frame / 2 ? char : char === ' ' ? ' ' : chars[(index + frame) % chars.length]).join('')); if (frame >= total) { window.clearInterval(id); setText(children); } }, 28); };
  return <span className={`scramble-line-lite ${className}`.trim()} onMouseEnter={scramble}>{text}</span>;
}
