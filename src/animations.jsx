// Landing motion adapted from the user-supplied Sara-Pragya React components.
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { startSiteCursor, startSmoothScroll } from './browser-effects.js';

export function SmoothScroll() {
  const reduced = useReducedMotion();
  useEffect(() => startSmoothScroll(), [reduced]);
  return null;
}

export function PrivacyWord() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const words = ['Private.', 'Local.', 'Yours.'];
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % words.length), 3000);
    return () => window.clearInterval(timer);
  }, [reduced]);
  return <span className="hero-word-loop" aria-label="Private. Local. Yours."><AnimatePresence initial={false}>
    <motion.span aria-hidden="true" key={index}
      initial={{ y: 20, rotateX: 90, opacity: 0, filter: 'blur(4px)' }}
      animate={{ y: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)' }}
      exit={{ y: -20, rotateX: -90, opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: reduced ? 0 : .15 }}>{words[index]}</motion.span>
  </AnimatePresence></span>;
}

export function PrivacyDemo() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const fields = [
    ['Name', 'Alex Morgan', 'PERSON_1'],
    ['Email', 'alex@example.test', 'EMAIL_1'],
    ['Account', 'DEMO-0427', 'ACCOUNT_1'],
  ];
  return <figure className={`privacy-demo${paused ? ' demo-paused' : ''}`}>
    <div className="demo-toolbar"><span>Privacy in motion</span>{!reduced && <button type="button" className="demo-pause"
      aria-label={paused ? 'Play workflow animation' : 'Pause workflow animation'} onClick={() => setPaused(value => !value)}>{paused ? 'Play' : 'Pause'}</button>}</div>
    <div className="demo-visual" role="img" aria-label="Fictional page details are scanned and replaced with placeholders locally. Only redacted context reaches the controlled PrivatePilot assistant.">
      <div aria-hidden="true">
        <div className="demo-browser">
          <div className="demo-browser-bar"><span className="demo-window-dots"><i /><i /><i /></span><span>Active browser tab</span><svg className="demo-tab-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></div>
          <div className="demo-page">
            <div className="demo-page-heading"><span>Your application</span><small>Fictional example</small></div>
            <div className="demo-fields">{fields.map(([label, raw, safe]) => <div className="demo-field" key={label}>
              <span className="demo-field-label">{label}</span><div className="demo-value"><span className="demo-raw">{raw}</span><span className="demo-safe">{safe}</span></div>
            </div>)}<span className="demo-scan-beam" /></div>
            <div className="demo-local-guard"><svg viewBox="0 0 24 24"><path d="m12 3 8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6Z" /><path d="m8 12 3 3 5-6" /></svg><span>PrivatePilot<span>Detect & redact on your device</span></span><i /></div>
          </div>
        </div>
        <div className="demo-handoff"><span className="demo-connection" /><span className="demo-packet">{ '{ }' }</span><span className="demo-handoff-label">Redacted context only</span></div>
        <div className="demo-assistant"><div className="demo-assistant-heading"><span className="demo-assistant-icon">✦</span><div>PrivatePilot assistant<small>Controlled workflow</small></div></div>
          <div className="demo-safe-payload"><span>PERSON_1</span><span>EMAIL_1</span><span>ACCOUNT_1</span></div>
        </div>
        <div className="demo-steps"><span>01 <b>Scan locally</b></span><span>02 <b>Replace values</b></span><span>03 <b>Share safely</b></span></div>
      </div>
    </div>
    <figcaption>Local detection → placeholders → controlled assistance</figcaption>
  </figure>;
}

export function Pillars({ items }) {
  const section = useRef(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let frame;
    const update = () => {
      const bounds = section.current.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(1, (window.innerHeight * .75 - bounds.top) / Math.max(1, bounds.height * 1.2))));
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [reduced]);
  return <div className="about-pillar-interaction" ref={section}><div className="container pillar-grid">
    {items.map((item, index) => {
      const start = index * .29;
      const amount = reduced ? 1 : Math.max(0, Math.min(1, (progress - start) / (Math.min(1, start + .32) - start)));
      return <article className="pillar" key={item.title} style={{ opacity: amount, filter: `blur(${7 * (1 - amount)}px)`, transform: `translateY(${42 * (1 - amount)}px) scale(${.94 + .06 * amount})` }}>
        <span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p>
      </article>;
    })}
  </div></div>;
}

export function Workflow({ steps }) {
  const stage = useRef(null);
  const nodes = useRef([]);
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(null);
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start 80%', 'end 25%'] });
  const dropTop = useTransform(scrollYProgress, [0, 1], ['8%', '86%']);
  useEffect(() => {
    let frame;
    const update = () => {
      const center = window.innerHeight / 2;
      const stageTop = stage.current.getBoundingClientRect().top + stage.current.clientTop;
      let nearest = { index: null, distance: Infinity };
      nodes.current.forEach((node, index) => {
        const bounds = node.getBoundingClientRect();
        if (index === 0 || index === nodes.current.length - 1) {
          stage.current.style.setProperty(index === 0 ? '--flow-start' : '--flow-end', `${bounds.top + bounds.height / 2 - stageTop}px`);
        }
        const distance = Math.abs(bounds.top + bounds.height / 2 - center);
        if (distance < nearest.distance) nearest = { index, distance };
      });
      setFocused(nearest.distance < window.innerHeight * .32 ? nearest.index : null);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);
  return <div className="container workflow-stage" aria-label="PrivatePilot controlled privacy workflow" ref={stage}>
    <div className="workflow-field" aria-hidden="true"><span className="vertical-flow-line" />
      {!reduced && <motion.span className="vertical-flow-drop" style={{ '--flow-progress': dropTop }} />}</div>
    <ol className="vertical-workflow">{steps.map((step, index) => <li key={step.title}>
      <span className="mobile-stage-line" aria-hidden="true" />
      <motion.div ref={node => { nodes.current[index] = node; }} className={`workflow-node${focused === index ? ' is-focused' : ''}`}
        animate={{ scale: !reduced && focused === index ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}>
        <span>Stage</span><strong>{String(index + 1).padStart(2, '0')}</strong>
      </motion.div>
      <article className={`workflow-timeline-card${focused === index ? ' is-focused' : ''}`}>
        <span>Step {String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.description}</p>
      </article>
    </li>)}</ol>
    <div className="workflow-result"><span>Outcome</span><strong>Useful assistance. Private values kept local.</strong></div>
  </div>;
}

export function SiteCursor() {
  const cursor = useRef(null);
  useEffect(() => startSiteCursor(cursor.current), []);
  return <div ref={cursor} className="motion-cursor site-cursor" aria-hidden="true"><div className="site-cursor-pill" /></div>;
}
