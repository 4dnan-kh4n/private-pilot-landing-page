import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { PrivacyDemo, Pillars, PrivacyWord, SiteCursor, SmoothScroll, Workflow } from './animations.jsx';
import './styles.css';
import release from './release.json';

const downloadUrl = `/downloads/privatepilot.zip?v=${release.version}`;

const navigation = [
  { href: '#about', label: 'About' },
  { href: '#workflow', label: 'How it works' },
  { href: '#install', label: 'Install' },
  { href: '#faq', label: 'FAQ' },
];
const pillars = [
  { title: 'Find private details', description: 'Look for details like your name, email, and account number in the text on your page. This check happens in your browser.' },
  { title: 'Hide details before sharing', description: 'Swap private details for labels like PERSON_1. The label takes the place of your real name. Check the text before you send it.' },
  { title: 'You decide', description: 'Choose which details to hide. See what the assistant will receive. Say yes or no before it fills an answer for you.' },
];
const workflowSteps = [
  { title: 'Check your open page', description: 'PrivatePilot checks the text you can see on the page. It works on regular websites, but cannot read Chrome settings or other pages the browser blocks.' },
  { title: 'Find private details', description: 'It looks for names, emails, phone numbers, account numbers, addresses, passwords, and one-time login codes. It may miss some details, so check the results.' },
  { title: 'Hide and review', description: 'Private details are replaced with labels. Compare the original text with the changed text and choose anything else you want to hide.' },
  { title: 'Ask for help', description: 'When you ask PrivatePilot’s assistant a question, it receives your question and the text with private details replaced. Your real details stay in your browser.' },
  { title: 'Say yes before it acts', description: 'The assistant can suggest an answer for an application form. You must approve it each time before PrivatePilot fills the answer on your page.' },
];
const questions = [
  { question: 'What does PrivatePilot do?', answer: 'It helps you hide private details before asking its AI assistant for help. It checks page text in your browser, swaps private details for labels, and lets you review the text before sending it.' },
  { question: 'Can a chatbot read my private page from a link?', answer: 'No. Sharing a link alone does not let a normal chatbot read a page you are logged into. Private details can be shared when you give a browser assistant permission to read that open page.' },
  { question: 'Does it protect me from every AI assistant?', answer: 'No. PrivatePilot works with its own assistant. It cannot control what Claude in Chrome, Perplexity Comet, or ChatGPT reads. Chrome also cannot promise that PrivatePilot checks a page before another assistant reads it.' },
  { question: 'What stays in my browser?', answer: 'Your original page text and the list that matches labels to your real details stay in your browser. Passwords, login codes, and browser login data are not sent to the assistant. Only your question and the text with private details replaced are sent when you ask for help.' },
  { question: 'Can I use the assistant right after installing?', answer: 'You can check and hide page text after installing. To get AI replies or fill an answer, you also need a page connected to the PrivatePilot service. Downloading the extension alone does not add an AI assistant to every website.' },
  { question: 'Which browser can I use?', answer: 'Use Chrome or another browser that supports Chrome extensions and a side panel. Give PrivatePilot permission to check your websites. It cannot read Chrome settings, the Chrome Web Store, extension pages, or other pages blocked by the browser.' },
  { question: 'Will it find every private detail?', answer: 'No. It can miss details written in an unusual way. Always check the text before sending it. Use made-up details when trying PrivatePilot.' },
];

function BrandMark() {
  return <a className="brand-mark" href="#home" aria-label="PrivatePilot home">
    <img src="/privatepilot-logo.png" alt="" width="42" height="42" />
    <span><strong>PrivatePilot</strong><small>Privacy before AI</small></span>
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
      <span className="eyebrow">Get PrivatePilot</span><h2 id="install-title">A few steps.<br />Ready to try.</h2>
      <p>Download PrivatePilot and add it to Chrome or a browser that supports Chrome extensions. Use made-up details when trying it.</p>
      <div className="release-card"><span className="release-label">PrivatePilot · v{release.version}</span>
        <p>Chrome extension · {(release.sizeBytes / 1_000_000).toFixed(1)} MB ZIP file</p>
        <a className="button button-primary" href={downloadUrl} download={release.fileName}>Download extension ZIP</a>
      </div>
      <p className="install-note"><strong>Checking page text works after installation.</strong> AI replies and form filling also need a page connected to the PrivatePilot service. Installing the extension alone does not add AI help to every website.</p>
    </div><ol className="install-steps">
      <li><span>01</span><div><h3>Download and unzip</h3><p>Download the ZIP file. Right-click it and choose <strong>Extract All</strong> to unzip it. Inside, you’ll find the <code>privatepilot-extension</code> folder and an <code>INSTALL.txt</code> guide.</p></div></li>
      <li><span>02</span><div><h3>Open your extensions page</h3><p>In Chrome, enter <code>chrome://extensions</code> in the address bar and turn on <strong>Developer mode</strong>.</p></div></li>
      <li><span>03</span><div><h3>Add the folder to Chrome</h3><p>Click <strong>Load unpacked</strong> and choose the <code>privatepilot-extension</code> folder you unzipped. Select the folder itself, not a file inside it.</p></div></li>
      <li><span>04</span><div><h3>Allow access and refresh</h3><p>Open the extension’s <strong>Details</strong>. To let PrivatePilot check regular websites, set <strong>Site access</strong> to <strong>On all sites</strong>. This gives it access across websites, so review that permission. Refresh the page you want to use.</p></div></li>
      <li><span>05</span><div><h3>Open PrivatePilot</h3><p>Open the PrivatePilot side panel next to your page. Check the original text and the version with private details hidden.</p></div></li>
    </ol></div>
  </section>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-grid">
    <div><BrandMark /><p>Hide private details.<br />Get help. Stay in control.</p></div>
    <div><h2>Explore</h2><a href="#about">About PrivatePilot</a><a href="#workflow">How it works</a><a href="#install">Installation</a></div>
    <div><h2>Privacy</h2><a href="#privacy">What to know</a><a href="#faq">Common questions</a></div>
    <div><h2>The project</h2><p>SIH26171 · ISRO problem statement</p><p>On-device Visual Perception for Light-weight Browser Agents</p><p>Try it with made-up details</p></div>
  </div><div className="container footer-bottom"><span>© 2026 PrivatePilot</span><span>Privacy before AI help</span></div></footer>;
}

function App() {
  return <MotionConfig reducedMotion="user"><SmoothScroll /><SiteCursor /><a className="skip-link" href="#main-content">Skip to content</a><Header />
    <main id="main-content" tabIndex="-1">
      <section className="landing-hero" id="home"><div className="hero-noise" aria-hidden="true" />
        <div className="container hero-grid landing-hero-grid"><div className="hero-copy">
          <p className="shloka">Your page. Your information. Your choice.</p>
          <p className="shloka-translation">Keep private details out of the text you share with our AI assistant.</p>
          <div className="hero-title-stage"><h1>Keep it <PrivacyWord /><br /><em>Hide details first.</em><span>Stay in control.</span></h1></div>
          <p className="hero-description">PrivatePilot checks the text on your page and swaps private details for simple labels. You review the text before sending it to PrivatePilot’s AI assistant.</p>
          <div className="hero-actions"><a className="button button-primary button-glow" href={downloadUrl} download={release.fileName}>Download extension</a><a className="button button-secondary" href="#workflow">See how it works</a></div>
        </div><PrivacyDemo /></div>
      </section>
      <section className="landing-section landing-about" id="about"><div className="container section-intro">
        <span className="eyebrow">Why PrivatePilot?</span><h2>Get AI help without sharing every detail.</h2>
        <p>When you let a browser AI assistant read a page you are logged into, it may also see private details on that page. PrivatePilot helps you replace those details before sharing the text with its own assistant.</p>
      </div><Pillars items={pillars} /></section>
      <section className="landing-section landing-workflow" id="workflow"><div className="container workflow-heading"><div>
        <span className="eyebrow">How PrivatePilot works</span><h2>Check. Hide. Ask.</h2>
      </div><p>Check what you share at each step. PrivatePilot asks for your permission before it fills an answer on your page.</p></div><Workflow steps={workflowSteps} /></section>
      <Install />
      <section className="landing-section landing-faq" id="faq"><div className="container faq-layout"><div className="faq-intro">
        <span className="eyebrow">Common questions</span><h2>Got a question?</h2><p>Here’s how to get started and what PrivatePilot can do.</p>
      </div><Faq /></div></section>
      <section className="privacy-boundary" id="privacy" aria-labelledby="privacy-title"><div className="container"><span className="eyebrow">What to know</span>
        <h2 id="privacy-title">Helpful, but it can miss things.</h2>
        <p>PrivatePilot may miss some private details, so always check the text before sending it. It works with its own assistant and cannot control other AI tools. Chrome cannot promise that it checks a page before another assistant reads it.</p>
        <p>A page link alone does not let a normal chatbot read your private, logged-in page. Use made-up details when trying PrivatePilot.</p>
      </div></section>
    </main><Footer />
  </MotionConfig>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
