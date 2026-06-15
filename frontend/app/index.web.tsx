/* DEQUAD Landing — Hinge-style editorial layout.
 * Design spec: /app/design_guidelines.json
 * Loaded only on web (Expo Router platform extension: .web.tsx).
 * Authenticated users are auto-redirected by useProtectedRoute in app/_layout.tsx.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Users,
  MessageCircle,
  AlertTriangle,
  Mail,
  Apple,
  Play,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Section: Hero
// ─────────────────────────────────────────────────────────────────────────────
const Hero = ({ onPrimary }: { onPrimary: () => void }) => (
  <section className="dq-section dq-hero" data-testid="hero-section">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="dq-hero__copy"
    >
      <p className="dq-label" data-testid="hero-label">THE SAFE STUDENT NETWORK</p>
      <h1 className="dq-h1" data-testid="hero-headline">
        Designed to make your university experience better — every single day.
      </h1>
      <p className="dq-body" data-testid="hero-sub">
        DEQUAD is the only university-verified platform built for real connections,
        daily wellbeing, and a community that always has your back.
      </p>
      <button
        type="button"
        className="dq-btn dq-btn--primary"
        onClick={onPrimary}
        data-testid="hero-cta-button"
      >
        Get Started
        <ArrowRight size={18} aria-hidden />
      </button>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="dq-hero__media"
    >
      <img
        src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80"
        alt="University students laughing together on campus"
        data-testid="hero-image"
      />
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Mission
// ─────────────────────────────────────────────────────────────────────────────
const Mission = () => (
  <section className="dq-section dq-mission" data-testid="mission-section">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <p className="dq-label">OUR APPROACH</p>
      <h2 className="dq-h2">
        Built for students, by students.<br />
        <span className="dq-h2--muted">Not for random dating.</span>
      </h2>
      <p className="dq-body dq-mission__body">
        University can be isolating. We built DEQUAD to help you find your actual
        peers — safely. No bots, no creeps, just verified students from your campus.
      </p>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Features (Bento Grid)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Users, title: 'Find your crowd.', desc: 'Peer matching based on modules, societies, and real interests.', size: 'lg' },
  { Icon: HeartPulse, title: 'Track your mind.', desc: 'Daily mood check-ins designed to keep you grounded.', size: 'sm' },
  { Icon: ShieldCheck, title: 'AI Safeguarding.', desc: 'Proactive crisis detection that keeps the community secure.', size: 'md' },
  { Icon: MessageCircle, title: '24/7 Support.', desc: 'Real help when you need it, instantly.', size: 'md' },
];

const Features = () => (
  <section className="dq-section dq-features" data-testid="features-section">
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="dq-label"
    >
      WHAT'S INSIDE
    </motion.p>
    <h2 className="dq-h2 dq-features__title">Everything you need. Nothing you don't.</h2>
    <div className="dq-bento">
      {FEATURES.map(({ Icon, title, desc, size }, i) => (
        <motion.article
          key={title}
          className={`dq-bento__card dq-bento__card--${size}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
          data-testid={`feature-card-${i + 1}`}
        >
          <Icon size={28} strokeWidth={1.6} className="dq-bento__icon" />
          <h3 className="dq-h3">{title}</h3>
          <p className="dq-body">{desc}</p>
        </motion.article>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Trust & Safety
// ─────────────────────────────────────────────────────────────────────────────
const TrustSafety = () => (
  <section className="dq-section dq-trust" data-testid="trust-safety-section">
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="dq-trust__media"
    >
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
        alt="Student studying calmly on campus"
        data-testid="trust-image"
      />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="dq-trust__copy"
    >
      <p className="dq-label">VERIFIED & PROTECTED</p>
      <h2 className="dq-h2">A closed network for peace of mind.</h2>
      <ul className="dq-trust__list">
        <li><ShieldCheck size={18} aria-hidden /> Requires an active <code>.ac.uk</code> university email</li>
        <li><AlertTriangle size={18} aria-hidden /> AI moderation flags at-risk content instantly</li>
        <li><HeartPulse size={18} aria-hidden /> Zero tolerance for harassment</li>
      </ul>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Testimonials
// ─────────────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Finally, an app where I can just meet people from my course without it feeling like Tinder.', author: 'Sarah, UoB' },
  { text: 'The mood tracking actually helps me realise when I\'m burning out before exams.', author: 'James, LSE' },
  { text: 'Knowing everyone on here is a verified student makes it so much less daunting.', author: 'Priya, KCL' },
];

const Testimonials = () => (
  <section className="dq-section dq-testimonials" data-testid="testimonials-section">
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="dq-label"
    >
      FROM REAL STUDENTS
    </motion.p>
    <h2 className="dq-h2 dq-testimonials__title">Less doomscroll. More real moments.</h2>
    <div className="dq-quotes">
      {QUOTES.map(({ text, author }, i) => (
        <motion.figure
          key={author}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
          data-testid={`testimonial-${i + 1}`}
        >
          <span className="dq-quote-mark" aria-hidden>"</span>
          <blockquote>{text}</blockquote>
          <figcaption>— {author}</figcaption>
        </motion.figure>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: FAQ
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'Do I need a university email?', a: 'Yes. DEQUAD is strictly for verified UK university students. You sign up using your .ac.uk email so we can keep the network closed and safe.' },
  { q: 'Is my mood data private?', a: '100%. We never share your personal health data with your university, employers, or any third party. You own your data and can delete it any time.' },
  { q: 'How does AI safeguarding work?', a: 'Our system scans messages and posts for patterns related to self-harm, crisis, or harassment, and proactively surfaces support resources — without exposing your identity to anyone except a trained safeguarding officer when there is risk to life.' },
  { q: 'Is DEQUAD a dating app?', a: 'No. DEQUAD is for friendship, study groups, and peer support. Romantic matches happen — but the focus is real student connections, not swiping.' },
  { q: 'How much does it cost?', a: 'Free during beta. We may introduce optional premium features later, but the core platform will always be free for verified students.' },
];

const FaqItem = ({ q, a, idx }: { q: string; a: string; idx: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className={`dq-faq__item${open ? ' is-open' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
    >
      <button
        type="button"
        className="dq-faq__q"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        data-testid={`faq-q-${idx + 1}`}
      >
        <span>{q}</span>
        <ChevronDown size={20} aria-hidden className={open ? 'is-rot' : ''} />
      </button>
      {open && <p className="dq-faq__a" data-testid={`faq-a-${idx + 1}`}>{a}</p>}
    </motion.div>
  );
};

const FAQ = () => (
  <section className="dq-section dq-faq" data-testid="faq-section">
    <motion.h2
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="dq-h2"
    >
      Questions? We've got you.
    </motion.h2>
    <div className="dq-faq__list">
      {FAQ_ITEMS.map((it, i) => <FaqItem key={it.q} idx={i} {...it} />)}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Final CTA / Footer
// ─────────────────────────────────────────────────────────────────────────────
const FooterCta = ({ onPrimary }: { onPrimary: () => void }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.post('/waitlist', { email: email.trim().toLowerCase() });
      setStatus('ok');
      setEmail('');
    } catch (err: any) {
      setStatus('err');
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="dq-footer" data-testid="footer-section">
      <div className="dq-footer__inner">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="dq-footer__title"
        >
          Join the beta.
        </motion.h2>

        <form className="dq-waitlist" onSubmit={handleSubmit}>
          <label htmlFor="dq-email" className="dq-sr-only">University email</label>
          <div className="dq-waitlist__field">
            <Mail size={18} aria-hidden />
            <input
              id="dq-email"
              type="email"
              required
              placeholder="Enter your .ac.uk email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
              data-testid="waitlist-email-input"
            />
          </div>
          <button
            type="submit"
            className="dq-btn dq-btn--accent"
            disabled={status === 'sending'}
            data-testid="waitlist-submit"
          >
            {status === 'sending' ? 'Submitting…' : 'Join Waitlist'}
            <ArrowRight size={18} aria-hidden />
          </button>
        </form>
        {status === 'ok' && (
          <p className="dq-waitlist__msg dq-waitlist__msg--ok" data-testid="waitlist-success">
            You're on the list. We'll be in touch soon.
          </p>
        )}
        {status === 'err' && (
          <p className="dq-waitlist__msg dq-waitlist__msg--err" data-testid="waitlist-error">
            {errorMsg}
          </p>
        )}

        <div className="dq-footer__divider" />

        <div className="dq-footer__cta-row">
          <button
            type="button"
            className="dq-btn dq-btn--ghost"
            onClick={onPrimary}
            data-testid="footer-signup-cta"
          >
            Sign up with university email
          </button>
          <div className="dq-stores">
            <a
              href="#"
              className="dq-store"
              data-testid="appstore-link"
              onClick={(e) => e.preventDefault()}
            >
              <Apple size={18} aria-hidden />
              <span>
                <small>Coming soon to</small>
                <strong>App Store</strong>
              </span>
            </a>
            <a
              href="#"
              className="dq-store"
              data-testid="playstore-link"
              onClick={(e) => e.preventDefault()}
            >
              <Play size={18} aria-hidden />
              <span>
                <small>Coming soon to</small>
                <strong>Google Play</strong>
              </span>
            </a>
          </div>
        </div>

        <div className="dq-footer__legal">
          <span>© {new Date().getFullYear()} DEQUAD. Built with care for students everywhere.</span>
          <div className="dq-footer__links">
            <a href="#" data-testid="footer-privacy">Privacy</a>
            <a href="#" data-testid="footer-terms">Terms</a>
            <a href="mailto:hello@dequad.co.uk" data-testid="footer-contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sticky nav with logo + primary CTA
// ─────────────────────────────────────────────────────────────────────────────
const Nav = ({ onPrimary }: { onPrimary: () => void }) => (
  <header className="dq-nav" data-testid="nav">
    <a href="/" className="dq-nav__brand" data-testid="nav-brand">
      <span className="dq-nav__logo">DQ</span>
      <span className="dq-nav__name">DEQUAD</span>
    </a>
    <button
      type="button"
      className="dq-btn dq-btn--primary dq-btn--sm"
      onClick={onPrimary}
      data-testid="nav-cta"
    >
      Get Started
    </button>
  </header>
);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingWeb() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Inject Google Fonts once
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('dq-fonts')) return;
    const link = document.createElement('link');
    link.id = 'dq-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  // Redirect authenticated users — defensive (also handled by _layout protected route)
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/(main)/mood');
  }, [isAuthenticated, isLoading, router]);

  const handlePrimary = async () => {
    try {
      await login();
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  return (
    <div className="dq-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav onPrimary={handlePrimary} />
      <main>
        <Hero onPrimary={handlePrimary} />
        <Mission />
        <Features />
        <TrustSafety />
        <Testimonials />
        <FAQ />
      </main>
      <FooterCta onPrimary={handlePrimary} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS (single block — kept here so the file is self-contained)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
:root {
  --bg: #FAF9F6;
  --text: #1C1917;
  --text-muted: #57534E;
  --cta: #0F172A;
  --cta-text: #FFFFFF;
  --card: #FFFFFF;
  --border: #E7E5E4;
  --accent: #D4A373;
  --max: 1240px;
}
* { box-sizing: border-box; }
html, body, #root { background: var(--bg); margin: 0; padding: 0; }
.dq-root { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--text); background: var(--bg); min-height: 100vh; }
.dq-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* Typography */
.dq-h1 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: clamp(40px, 6vw, 80px); line-height: 0.98; letter-spacing: -0.02em; margin: 0 0 24px; color: var(--text); }
.dq-h2 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: clamp(32px, 4.4vw, 56px); line-height: 1.05; letter-spacing: -0.015em; margin: 0 0 24px; color: var(--text); }
.dq-h2--muted { color: var(--text-muted); font-weight: 500; font-style: italic; }
.dq-h3 { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: clamp(20px, 2vw, 26px); line-height: 1.2; margin: 12px 0 6px; }
.dq-body { font-size: 17px; line-height: 1.6; color: var(--text-muted); margin: 0; }
.dq-label { font-size: 12px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 22px; }

/* Buttons */
.dq-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 28px; border-radius: 999px; font-weight: 700; font-size: 15px; letter-spacing: 0.04em; text-decoration: none; cursor: pointer; border: none; transition: transform 200ms ease, background-color 200ms ease, color 200ms ease, box-shadow 200ms ease; }
.dq-btn:hover { transform: translateY(-1px); }
.dq-btn--primary { background: var(--cta); color: var(--cta-text); }
.dq-btn--primary:hover { background: #1f2937; }
.dq-btn--accent { background: var(--accent); color: #1C1917; }
.dq-btn--accent:hover { background: #c2916a; }
.dq-btn--ghost { background: transparent; color: var(--text); border: 1.5px solid var(--text); }
.dq-btn--ghost:hover { background: var(--text); color: var(--bg); }
.dq-btn--sm { padding: 11px 18px; font-size: 13px; }
.dq-btn[disabled] { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Nav */
.dq-nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 18px max(24px, calc((100vw - var(--max)) / 2)); background: rgba(250, 249, 246, 0.85); backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px); border-bottom: 1px solid var(--border); }
.dq-nav__brand { display: inline-flex; align-items: center; gap: 12px; color: var(--text); text-decoration: none; }
.dq-nav__logo { width: 36px; height: 36px; border-radius: 10px; background: var(--cta); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; }
.dq-nav__name { font-weight: 700; letter-spacing: 0.18em; font-size: 13px; }

/* Sections */
.dq-section { padding: 96px max(24px, calc((100vw - var(--max)) / 2)); max-width: 100vw; }

/* Hero */
.dq-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 64px; align-items: center; padding-top: 56px; padding-bottom: 96px; }
.dq-hero__copy { max-width: 560px; }
.dq-hero__media img { width: 100%; height: 100%; max-height: 640px; object-fit: cover; border-radius: 24px; box-shadow: 0 30px 60px -30px rgba(15,23,42,0.25); }

/* Mission */
.dq-mission { text-align: center; padding-top: 56px; padding-bottom: 56px; }
.dq-mission > div { max-width: 880px; margin: 0 auto; }
.dq-mission__body { max-width: 600px; margin: 24px auto 0; font-size: 19px; }

/* Bento Features */
.dq-features__title { max-width: 640px; margin-bottom: 56px; }
.dq-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.dq-bento__card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 36px 32px; min-height: 220px; transition: transform 250ms ease, box-shadow 250ms ease; }
.dq-bento__card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -25px rgba(15,23,42,0.18); }
.dq-bento__card--lg { grid-column: span 8; min-height: 280px; }
.dq-bento__card--md { grid-column: span 6; }
.dq-bento__card--sm { grid-column: span 4; }
.dq-bento__icon { color: var(--accent); margin-bottom: 18px; }
.dq-bento__card .dq-body { font-size: 16px; }

/* Trust */
.dq-trust { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.dq-trust__media img { width: 100%; height: 100%; max-height: 580px; object-fit: cover; border-radius: 24px; }
.dq-trust__list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 16px; }
.dq-trust__list li { display: flex; align-items: flex-start; gap: 12px; font-size: 17px; color: var(--text); }
.dq-trust__list svg { color: var(--accent); margin-top: 3px; flex-shrink: 0; }
.dq-trust__list code { background: #F3F1EC; padding: 2px 8px; border-radius: 6px; font-size: 0.9em; }

/* Testimonials */
.dq-testimonials { text-align: left; }
.dq-testimonials__title { max-width: 640px; margin-bottom: 64px; }
.dq-quotes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.dq-quotes figure { margin: 0; }
.dq-quote-mark { font-family: 'Playfair Display', serif; font-size: 72px; line-height: 0.5; color: var(--accent); display: block; margin-bottom: 4px; }
.dq-quotes blockquote { font-family: 'Playfair Display', serif; font-size: 22px; line-height: 1.4; margin: 0 0 18px; color: var(--text); font-weight: 500; }
.dq-quotes figcaption { font-size: 13px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); }

/* FAQ */
.dq-faq { max-width: 880px; margin: 0 auto; }
.dq-faq__list { margin-top: 32px; border-top: 1px solid var(--border); }
.dq-faq__item { border-bottom: 1px solid var(--border); }
.dq-faq__q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 0; background: transparent; border: none; cursor: pointer; font-family: 'Manrope', sans-serif; font-size: 19px; font-weight: 600; color: var(--text); text-align: left; }
.dq-faq__q svg { transition: transform 200ms ease; color: var(--text-muted); flex-shrink: 0; }
.dq-faq__q svg.is-rot { transform: rotate(180deg); }
.dq-faq__a { padding: 0 0 28px; margin: 0; max-width: 720px; font-size: 17px; line-height: 1.6; color: var(--text-muted); }

/* Footer */
.dq-footer { background: var(--cta); color: #F8FAFC; padding: 96px max(24px, calc((100vw - var(--max)) / 2)) 56px; }
.dq-footer__inner { max-width: var(--max); margin: 0 auto; }
.dq-footer__title { font-family: 'Playfair Display', serif; font-size: clamp(40px, 6vw, 80px); font-weight: 700; line-height: 1; margin: 0 0 40px; letter-spacing: -0.02em; }
.dq-waitlist { display: grid; grid-template-columns: 1fr auto; gap: 12px; max-width: 600px; }
.dq-waitlist__field { display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; color: #F8FAFC; }
.dq-waitlist__field svg { color: rgba(248,250,252,0.6); flex-shrink: 0; }
.dq-waitlist__field input { flex: 1; background: transparent; border: none; outline: none; color: #F8FAFC; font-family: 'Manrope', sans-serif; font-size: 15px; min-width: 0; }
.dq-waitlist__field input::placeholder { color: rgba(248,250,252,0.5); }
.dq-waitlist__msg { margin: 14px 0 0; font-size: 14px; }
.dq-waitlist__msg--ok { color: #A7F3D0; }
.dq-waitlist__msg--err { color: #FCA5A5; }

.dq-footer__divider { height: 1px; background: rgba(248,250,252,0.1); margin: 48px 0; }

.dq-footer__cta-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
.dq-footer__cta-row .dq-btn--ghost { color: #F8FAFC; border-color: rgba(248,250,252,0.3); }
.dq-footer__cta-row .dq-btn--ghost:hover { background: #F8FAFC; color: var(--cta); }

.dq-stores { display: flex; gap: 12px; }
.dq-store { display: inline-flex; align-items: center; gap: 10px; padding: 12px 18px; border: 1px solid rgba(248,250,252,0.25); border-radius: 12px; text-decoration: none; color: #F8FAFC; transition: background 200ms ease; }
.dq-store:hover { background: rgba(248,250,252,0.06); }
.dq-store small { display: block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.6; }
.dq-store strong { display: block; font-size: 14px; font-weight: 700; }

.dq-footer__legal { display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: center; margin-top: 48px; font-size: 13px; color: rgba(248,250,252,0.5); }
.dq-footer__links { display: flex; gap: 24px; }
.dq-footer__links a { color: rgba(248,250,252,0.7); text-decoration: none; }
.dq-footer__links a:hover { color: #F8FAFC; }

/* Responsive */
@media (max-width: 980px) {
  .dq-section { padding: 64px 24px; }
  .dq-hero { grid-template-columns: 1fr; gap: 40px; padding-top: 32px; }
  .dq-hero__media { order: -1; }
  .dq-hero__media img { max-height: 360px; }
  .dq-trust { grid-template-columns: 1fr; }
  .dq-trust__media { order: -1; }
  .dq-trust__media img { max-height: 360px; }
  .dq-bento__card--lg, .dq-bento__card--md, .dq-bento__card--sm { grid-column: span 12; }
  .dq-quotes { grid-template-columns: 1fr; gap: 32px; }
  .dq-waitlist { grid-template-columns: 1fr; }
  .dq-footer__cta-row { flex-direction: column; align-items: stretch; }
  .dq-footer__legal { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 540px) {
  .dq-nav { padding: 14px 20px; }
  .dq-nav__name { display: none; }
  .dq-section { padding: 56px 20px; }
  .dq-stores { width: 100%; }
  .dq-store { flex: 1; justify-content: center; }
}
`;
