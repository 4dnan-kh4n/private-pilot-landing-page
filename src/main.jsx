import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { PrivacyDemo, Pillars, PrivacyWord, SiteCursor, SmoothScroll, Workflow } from './animations.jsx';
import './styles.css';
import release from './release.json';

const downloadUrl = '/downloads/privatepilot.zip';

const navigation = [
  { href: '#about', label: 'About' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#install', label: 'Install' },
  { href: '#faq', label: 'FAQ' },
];
const pillars = [
  { title: 'Detect locally', description: 'Find supported sensitive text in visible page content. Optional OCR reads text in images inside your browser.' },
  { title: 'Redact before sharing', description: 'Replace private values with placeholders such as PERSON_1 and ACCOUNT_1. Review the redacted context before asking.' },
  { title: 'Keep you in control', description: 'Mark fields as private, inspect the safe payload, and approve or reject every suggested action.' },
];
const workflowSteps = [
  { title: 'Read the active page', description: 'PrivatePilot scans visible text locally on normal HTTP and HTTPS webpages. Browser-internal and protected pages remain inaccessible.' },
  { title: 'Find private information', description: 'Local rules detect supported names, emails, phone numbers, accounts, addresses, passwords, and OTP fields. Visual scanning runs only when you choose it.' },
  { title: 'Replace and review', description: 'Private values become placeholders. Compare the original local context with the safe version; the real-value mapping stays in extension memory.' },
  { title: 'Ask with safe context', description: 'In the controlled PrivatePilot workflow, only the redacted context and your question go to the assistant backend. Screenshots and raw OCR text stay local.' },
  { title: 'Approve a local action', description: 'The assistant can suggest filling a supported application-answer field. You confirm every action before the extension fills it locally.' },
];
const questions = [
  { question: 'What does PrivatePilot do?', answer: 'PrivatePilot is a controlled privacy layer for browser AI assistance. It detects supported sensitive information locally, replaces it with placeholders, and lets you review the context sent to its own assistant. Detection is heuristic and can miss unfamiliar formats.' },
  { question: 'Does sharing a webpage URL expose my private information?', answer: 'A normal chatbot cannot read your logged-in page just because you share its URL. The privacy risk starts when a browser assistant is allowed to read or analyse the active logged-in tab.' },
  { question: 'Can it protect me from every browser AI assistant?', answer: 'PrivatePilot does not intercept or control closed products such as Claude in Chrome, Perplexity Comet, or ChatGPT. Chrome also does not guarantee that this extension runs before another browser agent reads the page.' },
  { question: 'What stays inside my browser?', answer: 'The original page context, screenshots, raw OCR text, and real-value-to-placeholder mappings remain local. Passwords, OTPs, cookies, and placeholder maps must never be included in assistant requests. The safe context and your question are sent only when you ask the controlled assistant.' },
  { question: 'Will the assistant work immediately after installation?', answer: 'Local DOM redaction and optional OCR work without the assistant backend. The current extension sends assistant requests to the active webpage’s PrivatePilot endpoint, so assistant replies and suggested actions require a page served by that backend. The ZIP alone does not provide an assistant service for arbitrary websites.' },
  { question: 'Which browsers and pages are supported?', answer: 'PrivatePilot uses Chrome Manifest V3 and a side panel. Use a compatible Chrome or Chromium browser. The local guard runs on normal HTTP and HTTPS pages when site access is granted. Chrome restricts browser-internal pages, extension pages, the Chrome Web Store, and other protected pages.' },
  { question: 'How reliable is the visual scan?', answer: 'Tesseract OCR runs locally using bundled files and English language data. It can miss low-quality, blurred, stylised, or obscured text. Use fictional data for demonstrations. Detection does not guarantee complete privacy protection.' },
];

function BrandMark() {
  return <a className="brand-mark" href="#home" aria-label="PrivatePilot home">
    <svg aria-hidden="true" viewBox="0 0 42 42"><path d="M21 5 35 11v10c0 8-7 13-14 16C14 34 7 29 7 21V11Z" /><path d="m14 21 5 5 10-11" /></svg>
    <span><strong>PRIVATEPILOT</strong><small>Privacy before AI</small></span>
  </a>;
}

function Header() {
  const [hovered, setHovered] = useState(null);
  const closeMobile = event => event.currentTarget.closest('details')?.removeAttribute('open');
  return <header className="site-header"><div className="container header-inner">
    <BrandMark />
    <nav className="desktop-navigation" aria-label="Primary navigation" onMouseLeave={() => setHovered(null)}>
      {navigation.map(item => <a className="animated-background-item" href={item.href} key={item.href}
        onMouseEnter={() => setHovered(item.href)} onFocus={() => setHovered(item.href)} onBlur={() => setHovered(null)}>
        <AnimatePresence initial={false}>{hovered === item.href && <motion.span className="animated-background-surface"
          layoutId="navigation-highlight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ type: 'spring', bounce: .2, duration: .3 }} />}</AnimatePresence>
        <span className="animated-background-content">{item.label}</span>
      </a>)}
    </nav>
    <a className="button button-primary desktop-cta" href={downloadUrl} download={release.fileName}>Download extension</a>
    <details className="mobile-navigation"><summary aria-label="Open navigation menu"><span /><span /><span /></summary>
      <nav aria-label="Mobile navigation">{navigation.map(item => <a href={item.href} key={item.href} onClick={closeMobile}>{item.label}</a>)}
        <a className="button button-primary" href={downloadUrl} download={release.fileName} onClick={closeMobile}>Download extension</a>
      </nav>
    </details>
  </div></header>;
}

function Faq() {
  const [expanded, setExpanded] = useState(null);
  const reduced = useReducedMotion();
  return <div className="faq-accordion">{questions.map((item, index) => <div className="faq-item" key={item.question}>
    <h3><button className="faq-trigger" type="button" id={`faq-question-${index}`} aria-expanded={expanded === index}
      aria-controls={`faq-answer-${index}`} data-expanded={expanded === index || undefined}
      onClick={() => setExpanded(current => current === index ? null : index)}>
      <svg className="faq-chevron" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <span>{item.question}</span>
    </button></h3>
    <motion.div className="faq-content" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`}
      aria-hidden={expanded !== index} initial={false} animate={{ height: expanded === index ? 'auto' : 0, opacity: expanded === index ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : .25 }}><p>{item.answer}</p></motion.div>
  </div>)}</div>;
}

function Install() {
  return <section className="landing-section landing-install" id="install" aria-labelledby="install-title">
    <div className="container install-layout"><div className="install-intro">
      <span className="eyebrow">Bring privacy to your browser</span><h2 id="install-title">One extension.<br />A more careful workflow.</h2>
      <p>Install the unpacked PrivatePilot extension in Chrome or a compatible Chromium browser. Use fictional data when trying it.</p>
      <div className="release-card"><span className="release-label">PrivatePilot · v{release.version}</span>
        <p>Manual installation · Manifest V3 · {(release.sizeBytes / 1_000_000).toFixed(1)} MB ZIP</p>
        <a className="button button-primary" href={downloadUrl} download={release.fileName}>Download extension ZIP</a>
      </div>
      <p className="install-note"><strong>Local scanning works independently.</strong> Assistant replies and suggested actions currently require a page served by the PrivatePilot backend. Installing the extension alone does not enable AI assistance on every website.</p>
    </div><ol className="install-steps">
      <li><span>01</span><div><h3>Download and extract</h3><p>Download the ZIP and extract it. You’ll find a <code>privatepilot-extension</code> folder and an <code>INSTALL.txt</code> guide inside.</p></div></li>
      <li><span>02</span><div><h3>Open your extensions page</h3><p>In Chrome, enter <code>chrome://extensions</code> in the address bar and turn on <strong>Developer mode</strong>.</p></div></li>
      <li><span>03</span><div><h3>Load the extension folder</h3><p>Select <strong>Load unpacked</strong> and choose <code>privatepilot-extension</code>, the extracted folder containing <code>manifest.json</code>. Choose the folder, not the ZIP or the JSON file.</p></div></li>
      <li><span>04</span><div><h3>Review access and reload</h3><p>In extension Details, review the broad site-access permission and choose <strong>On all sites</strong> to use the local guard across normal webpages. Reload your target page.</p></div></li>
      <li><span>05</span><div><h3>Open PrivatePilot</h3><p>Open its side panel, review the local and redacted context, and choose a visual scan if needed.</p></div></li>
    </ol></div>
  </section>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div><BrandMark /><p>Local perception. Redacted context.<br />Assistance with your approval.</p></div>
    <div><h2>Explore</h2><a href="#about">About PrivatePilot</a><a href="#workflow">How it works</a><a href="#install">Installation</a></div>
    <div><h2>Privacy</h2><a href="#privacy">Technical boundaries</a><a href="#faq">Common questions</a></div>
    <div><h2>The project</h2><p>SIH26171 · ISRO problem statement</p><p>On-device Visual Perception for Light-weight Browser Agents</p><p>Controlled workflow · Fictional demo data</p></div>
  </div><div className="container footer-bottom"><span>© 2026 PrivatePilot</span><span>A proposed controlled privacy layer</span></div></footer>;
}

function App() {
  return <MotionConfig reducedMotion="user"><SmoothScroll /><SiteCursor /><a className="skip-link" href="#main-content">Skip to content</a><Header />
    <main id="main-content" tabIndex="-1">
      <section className="landing-hero" id="home"><div className="hero-noise" aria-hidden="true" />
        <div className="container hero-grid landing-hero-grid"><div className="hero-copy">
          <p className="shloka">Your page. Your information. Your choice.</p>
          <p className="shloka-translation">A proposed privacy layer for the moments you let AI read your browser.</p>
          <div className="hero-title-stage"><h1>Keep it <PrivacyWord /><br /><em>Redact before AI.</em><span>Stay in control.</span></h1></div>
          <p className="hero-description">PrivatePilot finds sensitive information locally in your browser and replaces it with placeholders before sharing context with its controlled assistant.</p>
          <div className="hero-actions"><a className="button button-primary button-glow" href={downloadUrl} download={release.fileName}>Download extension</a><a className="button button-secondary" href="#workflow">Explore the method</a></div>
        </div><PrivacyDemo /></div>
      </section>
      <section className="landing-section landing-about" id="about"><div className="container section-intro">
        <span className="eyebrow">Why PrivatePilot</span><h2>Useful AI assistance starts with a careful handoff.</h2>
        <p>When you allow a browser assistant to analyse a logged-in tab, information visible on that page can become AI context. PrivatePilot demonstrates a local step to detect and redact supported private values before that handoff.</p>
      </div><Pillars items={pillars} /></section>
      <section className="landing-section landing-workflow" id="workflow"><div className="container workflow-heading"><div>
        <span className="eyebrow">How the controlled workflow works</span><h2>From visible content to a safer assistant context.</h2>
      </div><p>Every stage remains reviewable. Visual scans need your action, and every suggested field fill needs your approval.</p></div><Workflow steps={workflowSteps} /></section>
      <Install />
      <section className="landing-section landing-faq" id="faq"><div className="container faq-layout"><div className="faq-intro">
        <span className="eyebrow">Common questions</span><h2>Quick answers about PrivatePilot.</h2><p>A short guide to local scanning, installation, and PrivatePilot’s technical boundaries.</p>
      </div><Faq /></div></section>
      <section className="privacy-boundary" id="privacy" aria-labelledby="privacy-title"><div className="container"><span className="eyebrow">Clear boundaries</span>
        <h2 id="privacy-title">A controlled privacy layer, with practical limits.</h2>
        <p>PII detection is heuristic, and OCR may miss difficult text. PrivatePilot does not intercept or control closed browser AI products. Chrome cannot guarantee it runs before another agent reads a page.</p>
        <p>A webpage URL alone does not give a normal chatbot access to private logged-in content. Use fictional data for demonstrations.</p>
      </div></section>
    </main><Footer />
  </MotionConfig>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
