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

// Inline SVG icons for social links — keeps us off the lucide-react versioning treadmill.
const SocialIcon = ({ kind }: { kind: 'instagram' | 'twitter' | 'facebook' }) => {
  const common = { width: 18, height: 18, fill: 'currentColor', 'aria-hidden': true as const };
  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07a6.7 6.7 0 012.23.41 3.7 3.7 0 011.36.88 3.7 3.7 0 01.88 1.36 6.7 6.7 0 01.41 2.23C21.8 8.4 21.8 8.8 21.8 12s0 3.6-.07 4.85a6.7 6.7 0 01-.41 2.23 3.7 3.7 0 01-.88 1.36 3.7 3.7 0 01-1.36.88 6.7 6.7 0 01-2.23.41C15.6 21.8 15.2 21.8 12 21.8s-3.6 0-4.85-.07a6.7 6.7 0 01-2.23-.41 3.7 3.7 0 01-1.36-.88 3.7 3.7 0 01-.88-1.36 6.7 6.7 0 01-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85a6.7 6.7 0 01.41-2.23 3.7 3.7 0 01.88-1.36 3.7 3.7 0 011.36-.88 6.7 6.7 0 012.23-.41C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.16 0-3.54.01-4.78.07-.95.05-1.47.2-1.82.34-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.13.35-.29.87-.34 1.82C4 8.46 4 8.84 4 12s.01 3.54.07 4.78c.05.95.2 1.47.34 1.82.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.13.87.29 1.82.34C8.46 20 8.84 20 12 20s3.54-.01 4.78-.07c.95-.05 1.47-.2 1.82-.34a3 3 0 001.13-.74 3 3 0 00.74-1.13c.13-.35.29-.87.34-1.82C20 15.54 20 15.16 20 12s-.01-3.54-.07-4.78c-.05-.95-.2-1.47-.34-1.82a3 3 0 00-.74-1.13 3 3 0 00-1.13-.74c-.35-.13-.87-.29-1.82-.34C15.54 4 15.16 4 12 4zm0 3.05a4.95 4.95 0 110 9.9 4.95 4.95 0 010-9.9zm0 1.8a3.15 3.15 0 100 6.3 3.15 3.15 0 000-6.3zm5.18-2.07a1.16 1.16 0 110 2.32 1.16 1.16 0 010-2.32z" />
      </svg>
    );
  }
  if (kind === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    );
  }
  // facebook
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M22 12a10 10 0 10-11.563 9.876v-6.987H7.898V12h2.539V9.798c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.889h-2.33v6.987A10 10 0 0022 12z" />
    </svg>
  );
};
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
        Starting university should be exciting — but for most students it's also lonely,
        overwhelming, and academically intense. Existing apps either treat you like a
        target audience or a swipe statistic. <strong>DEQUAD is different.</strong> We're
        a closed network of verified UK students, designed by students who lived through
        the loneliness, the exam stress, and the late-night safety scares, with one goal:
        make every day at university genuinely better.
      </p>
      <div className="dq-mission__stats">
        <div className="dq-stat" data-testid="stat-loneliness">
          <strong>54%</strong>
          <span>of UK students report frequent loneliness*</span>
        </div>
        <div className="dq-stat" data-testid="stat-mental-health">
          <strong>1 in 3</strong>
          <span>experience a mental-health issue during their degree*</span>
        </div>
        <div className="dq-stat" data-testid="stat-friends">
          <strong>71%</strong>
          <span>wish they'd made friends from outside their flat sooner*</span>
        </div>
      </div>
      <p className="dq-mission__footnote">*Sources: ONS, Student Minds, NUS surveys 2023–24.</p>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: How It Works — 3-step explanation
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Verify with your university email',
    desc: 'Sign up in 60 seconds using your .ac.uk address. We never share it. Once verified, you join a closed network of students from real UK universities — no bots, no fake profiles, no off-platform creeps.',
  },
  {
    n: '02',
    title: 'Build your profile around what actually matters',
    desc: 'Tag your course, society interests, study habits, and what you\'re looking for — study mates, society buddies, gym partners, or just someone to grab coffee with. No looks-first swiping. We surface compatibility based on overlap, not photos.',
  },
  {
    n: '03',
    title: 'Connect, chat, and look after your wellbeing',
    desc: 'Match with peers, message safely, log your daily mood, and access 24/7 support. Every conversation is monitored by safeguarding tools that quietly flag crisis content to trained admins — so help arrives before things escalate.',
  },
];

const HowItWorks = () => (
  <section className="dq-section dq-how" data-testid="how-section">
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="dq-label"
    >
      HOW IT WORKS
    </motion.p>
    <h2 className="dq-h2 dq-how__title">Three steps to a better year.</h2>
    <div className="dq-how__grid">
      {STEPS.map((s, i) => (
        <motion.div
          key={s.n}
          className="dq-step"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
          data-testid={`step-${i + 1}`}
        >
          <div className="dq-step__num">{s.n}</div>
          <h3 className="dq-h3">{s.title}</h3>
          <p className="dq-body">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section: Features (Bento Grid)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Users,
    title: 'Find your crowd.',
    desc: 'Peer matching based on the things that actually predict friendship — modules, society interests, study style, the music you listen to, the gym you go to. Verified .ac.uk emails only, so every match is a real student from a real campus.',
    size: 'lg',
  },
  {
    Icon: HeartPulse,
    title: 'Track your mind.',
    desc: 'Daily 10-second mood check-ins build a personal wellbeing baseline — so you spot a dip before it becomes a crisis, and so do we.',
    size: 'sm',
  },
  {
    Icon: ShieldCheck,
    title: 'Safeguarding that actually works.',
    desc: 'Every message is silently scanned for crisis language, harassment, and bullying. High-risk content triggers an instant alert to trained university safeguarding staff — not random moderators in another country. Privacy-first, not surveillance-first.',
    size: 'md',
  },
  {
    Icon: MessageCircle,
    title: '24/7 Support, human-backed.',
    desc: 'An assistant answers in seconds for the small stuff. For anything serious, a real human from the support team takes over. Average response time: under 4 minutes.',
    size: 'md',
  },
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
      <p className="dq-body" style={{ marginBottom: 24 }}>
        Most "social" apps trade your safety for growth. We do the opposite.
        DEQUAD is intentionally smaller, slower, and stricter — so when you make
        a connection here, you can trust it.
      </p>
      <ul className="dq-trust__list">
        <li><ShieldCheck size={18} aria-hidden /> <span><strong>Verified UK students only.</strong> Active <code>.ac.uk</code> email required at sign-up and re-checked each term.</span></li>
        <li><AlertTriangle size={18} aria-hidden /> <span><strong>Safeguarding in every message.</strong> Crisis language is flagged instantly to trained safeguarding leads, never to other students.</span></li>
        <li><HeartPulse size={18} aria-hidden /> <span><strong>Zero tolerance for harassment.</strong> Reports are reviewed within 4 hours by a human. Confirmed offenders are banned across the network.</span></li>
        <li><Users size={18} aria-hidden /> <span><strong>You own your data.</strong> One-tap export, one-tap delete. We never sell or share your info with universities, advertisers, or anyone else.</span></li>
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
  { q: 'What exactly is DEQUAD?', a: 'DEQUAD is a closed social network exclusively for verified UK university students. It brings three things into one app: (1) peer matching based on courses, societies, and real interests, (2) daily mood and wellbeing tracking, and (3) 24/7 supported help with built-in safeguarding. Think of it as the friend, mentor, and safety net you wish existed in Freshers\' week.' },
  { q: 'Do I need a university email?', a: 'Yes. DEQUAD is strictly for verified UK university students. You sign up with your .ac.uk email so the network stays closed and safe. If your university uses a different domain, contact us — we add new institutions weekly.' },
  { q: 'Is DEQUAD a dating app?', a: 'No. DEQUAD is for friendship, study groups, and peer support. Romantic matches do happen organically, but we don\'t prioritise looks-based swiping. The focus is real student connections, not chemistry-first chat.' },
  { q: 'What happens to my data if I delete my account?', a: 'Everything goes. We have a 30-day cooling-off window in case you change your mind, after which all your profile data, messages, mood logs, and matches are permanently erased from our servers and backups.' },
  { q: 'I\'m at a non-UK university — when can I join?', a: 'We\'re UK-first and rolling out by university. Drop your .edu or international email in the waitlist below and we\'ll let you know when your country opens.' },
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
            <a href="/privacy" data-testid="footer-privacy">Privacy</a>
            <a href="/terms" data-testid="footer-terms">Terms</a>
            <a href="/contact" data-testid="footer-contact">Contact</a>
            <a href="/admin/login" data-testid="footer-admin">Staff login</a>
          </div>
          <div className="dq-footer__social">
            <a
              href="https://www.instagram.com/dequadapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              data-testid="footer-instagram"
              className="dq-social"
            >
              <SocialIcon kind="instagram" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sticky nav with logo + primary CTA
// ─────────────────────────────────────────────────────────────────────────────
const Logo = ({ size = 40 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    role="img"
    aria-label="DEQUAD"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient id="dq-heart" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7AB3E0" />
        <stop offset="100%" stopColor="#5B9BD5" />
      </linearGradient>
    </defs>
    {/* Heart silhouette */}
    <path
      fill="url(#dq-heart)"
      d="M60 108 C 20 80, 8 56, 8 40 C 8 22, 22 10, 38 10 C 48 10, 56 16, 60 24 C 64 16, 72 10, 82 10 C 98 10, 112 22, 112 40 C 112 56, 100 80, 60 108 Z"
    />
    {/* DEQUAD wordmark inside heart top half */}
    <text
      x="60"
      y="50"
      textAnchor="middle"
      fontFamily="Manrope, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="18"
      letterSpacing="0.5"
      fill="#0F2942"
    >
      DEQUAD
    </text>
    {/* Bar-chart wellbeing motif */}
    <rect x="40" y="62" width="9" height="22" rx="2" fill="#FFFFFF" />
    <rect x="55.5" y="68" width="9" height="16" rx="2" fill="#FFFFFF" />
    <rect x="71" y="58" width="9" height="26" rx="2" fill="#FFFFFF" />
    {/* Teal swoosh */}
    <path
      d="M40 86 Q 60 96, 80 86"
      stroke="#4FB89F"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Nav = ({ onPrimary }: { onPrimary: () => void }) => (
  <header className="dq-nav" data-testid="nav">
    <a href="/" className="dq-nav__brand" data-testid="nav-brand">
      <Logo size={44} />
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

  // React Native Web wraps the app in flex containers that pin every parent to
  // 100% viewport height with overflow:hidden, which breaks long-form scrolling
  // on a marketing page. Inject overrides while the landing is mounted and tear
  // them down on unmount so the rest of the app's RN-styled screens stay intact.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const STYLE_ID = 'dq-landing-scroll-fix';
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html, body { height: auto !important; min-height: 100% !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch; }
      #root, #root > div, #root > div > div, #root > div > div > div { height: auto !important; min-height: 100vh !important; overflow: visible !important; flex: none !important; display: block !important; }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, []);

  // Redirect authenticated users — defensive (also handled by _layout protected route)
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/(main)/mood');
  }, [isAuthenticated, isLoading, router]);

  const handlePrimary = () => {
    // Route to the in-app login screen which offers BOTH Google sign-in and
    // email + password (sign-in or sign-up). Previously this called login()
    // directly, which jumped straight to Google OAuth and gave users no other
    // option.
    router.push('/(auth)/login' as any);
  };

  return (
    <div className="dq-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav onPrimary={handlePrimary} />
      <main>
        <Hero onPrimary={handlePrimary} />
        <Mission />
        <HowItWorks />
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
  /* Theme drawn from the DEQUAD heart logo: friendly student blue, deep navy, teal accent. */
  --bg: #F6FAFE;
  --bg-soft: #EDF4FB;
  --text: #0F2942;
  --text-muted: #4F6076;
  --cta: #0F2942;
  --cta-text: #FFFFFF;
  --card: #FFFFFF;
  --border: #DDE8F2;
  --brand: #5B9BD5;        /* heart blue */
  --brand-soft: #B7D4EE;
  --accent: #4FB89F;       /* teal swoosh */
  --accent-soft: #C2E6DA;
  --max: 1240px;
}
* { box-sizing: border-box; }
/* Override Expo Router / react-native-web's fixed-height body which prevents scrolling. */
html, body { height: auto !important; min-height: 100%; overflow-x: hidden; overflow-y: auto !important; -webkit-overflow-scrolling: touch; }
body, #root, #root > div, #root > div > div { background: var(--bg); margin: 0; padding: 0; }
#root, #root > div { height: auto !important; min-height: 100vh; overflow: visible !important; display: block !important; }
.dq-root { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--text); background: var(--bg); min-height: 100vh; overflow: visible; }
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
.dq-btn--primary:hover { background: #1c4271; box-shadow: 0 10px 24px -10px rgba(15,41,66,0.5); }
.dq-btn--accent { background: var(--brand); color: #FFFFFF; }
.dq-btn--accent:hover { background: #4a86bc; }
.dq-btn--ghost { background: transparent; color: var(--text); border: 1.5px solid var(--text); }
.dq-btn--ghost:hover { background: var(--text); color: var(--bg); }
.dq-btn--sm { padding: 11px 18px; font-size: 13px; }
.dq-btn[disabled] { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Nav */
.dq-nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 14px max(24px, calc((100vw - var(--max)) / 2)); background: rgba(246, 250, 254, 0.88); backdrop-filter: saturate(180%) blur(16px); -webkit-backdrop-filter: saturate(180%) blur(16px); border-bottom: 1px solid var(--border); }
.dq-nav__brand { display: inline-flex; align-items: center; gap: 12px; color: var(--text); text-decoration: none; }
.dq-nav__name { font-weight: 800; letter-spacing: 0.18em; font-size: 13px; }

/* Sections */
.dq-section { padding: 96px max(24px, calc((100vw - var(--max)) / 2)); max-width: 100vw; }

/* Hero */
.dq-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 64px; align-items: center; padding-top: 56px; padding-bottom: 96px; }
.dq-hero__copy { max-width: 560px; }
.dq-hero__media img { width: 100%; height: 100%; max-height: 640px; object-fit: cover; border-radius: 24px; box-shadow: 0 30px 60px -30px rgba(15,23,42,0.25); }

/* Mission */
.dq-mission { text-align: center; padding-top: 56px; padding-bottom: 56px; }
.dq-mission > div { max-width: 880px; margin: 0 auto; }
.dq-mission__body { max-width: 700px; margin: 24px auto 0; font-size: 19px; line-height: 1.65; text-align: left; }
.dq-mission__body strong { color: var(--text); font-weight: 700; }
.dq-mission__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; text-align: left; }
.dq-stat { padding: 28px 24px; background: var(--card); border: 1px solid var(--border); border-radius: 20px; }
.dq-stat strong { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: clamp(40px, 4vw, 56px); line-height: 1; color: var(--accent); display: block; margin-bottom: 10px; letter-spacing: -0.02em; }
.dq-stat span { font-size: 15px; color: var(--text-muted); line-height: 1.5; }
.dq-mission__footnote { margin-top: 16px; font-size: 12px; color: var(--text-muted); text-align: center; opacity: 0.8; }

/* How it works */
.dq-how__title { max-width: 640px; margin-bottom: 64px; }
.dq-how__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.dq-step { position: relative; }
.dq-step__num { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; font-size: 56px; color: var(--accent); line-height: 1; margin-bottom: 24px; letter-spacing: -0.02em; }
.dq-step h3 { margin: 0 0 14px; }
.dq-step .dq-body { font-size: 16px; line-height: 1.65; }

/* Bento Features */
.dq-features__title { max-width: 640px; margin-bottom: 56px; }
.dq-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.dq-bento__card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 36px 32px; min-height: 220px; transition: transform 250ms ease, box-shadow 250ms ease; }
.dq-bento__card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -25px rgba(15,23,42,0.18); }
.dq-bento__card--lg { grid-column: span 8; min-height: 280px; }
.dq-bento__card--md { grid-column: span 6; }
.dq-bento__card--sm { grid-column: span 4; }
.dq-bento__icon { color: var(--brand); margin-bottom: 18px; }
.dq-bento__card .dq-body { font-size: 16px; }

/* Trust */
.dq-trust { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.dq-trust__media img { width: 100%; height: 100%; max-height: 580px; object-fit: cover; border-radius: 24px; }
.dq-trust__list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 16px; }
.dq-trust__list li { display: flex; align-items: flex-start; gap: 12px; font-size: 17px; color: var(--text); }
.dq-trust__list svg { color: var(--brand); margin-top: 3px; flex-shrink: 0; }
.dq-trust__list code { background: var(--bg-soft); padding: 2px 8px; border-radius: 6px; font-size: 0.9em; color: var(--text); }

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
.dq-footer__social { display: flex; gap: 12px; }
.dq-social { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(248,250,252,0.08); color: rgba(248,250,252,0.7); text-decoration: none; transition: background-color 200ms ease, color 200ms ease, transform 200ms ease; }
.dq-social:hover { background: rgba(248,250,252,0.18); color: #F8FAFC; transform: translateY(-2px); }

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
  .dq-mission__stats { grid-template-columns: 1fr; }
  .dq-how__grid { grid-template-columns: 1fr; gap: 36px; }
}
@media (max-width: 540px) {
  .dq-nav { padding: 14px 20px; }
  .dq-nav__name { display: none; }
  .dq-section { padding: 56px 20px; }
  .dq-stores { width: 100%; }
  .dq-store { flex: 1; justify-content: center; }
}
`;
