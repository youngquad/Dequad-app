/* Contact — Web only. Loaded at /contact. */
import React, { useEffect } from 'react';
import { Mail, MessageSquare, ShieldAlert } from 'lucide-react';

// Inline SVG icons for social links (lucide-react in this project doesn't export them)
const SocialIcon = ({ kind }: { kind: 'instagram' | 'twitter' | 'facebook' }) => {
  const common = { width: 18, height: 18, fill: 'currentColor', 'aria-hidden': true as const };
  if (kind === 'instagram') {
    return <svg viewBox="0 0 24 24" {...common}><path d="M12 2.2c3.2 0 3.6 0 4.85.07a6.7 6.7 0 012.23.41 3.7 3.7 0 011.36.88 3.7 3.7 0 01.88 1.36 6.7 6.7 0 01.41 2.23C21.8 8.4 21.8 8.8 21.8 12s0 3.6-.07 4.85a6.7 6.7 0 01-.41 2.23 3.7 3.7 0 01-.88 1.36 3.7 3.7 0 01-1.36.88 6.7 6.7 0 01-2.23.41C15.6 21.8 15.2 21.8 12 21.8s-3.6 0-4.85-.07a6.7 6.7 0 01-2.23-.41 3.7 3.7 0 01-1.36-.88 3.7 3.7 0 01-.88-1.36 6.7 6.7 0 01-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85a6.7 6.7 0 01.41-2.23 3.7 3.7 0 01.88-1.36 3.7 3.7 0 011.36-.88 6.7 6.7 0 012.23-.41C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.16 0-3.54.01-4.78.07-.95.05-1.47.2-1.82.34-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.13.35-.29.87-.34 1.82C4 8.46 4 8.84 4 12s.01 3.54.07 4.78c.05.95.2 1.47.34 1.82.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.13.87.29 1.82.34C8.46 20 8.84 20 12 20s3.54-.01 4.78-.07c.95-.05 1.47-.2 1.82-.34a3 3 0 001.13-.74 3 3 0 00.74-1.13c.13-.35.29-.87.34-1.82C20 15.54 20 15.16 20 12s-.01-3.54-.07-4.78c-.05-.95-.2-1.47-.34-1.82a3 3 0 00-.74-1.13 3 3 0 00-1.13-.74c-.35-.13-.87-.29-1.82-.34C15.54 4 15.16 4 12 4zm0 3.05a4.95 4.95 0 110 9.9 4.95 4.95 0 010-9.9zm0 1.8a3.15 3.15 0 100 6.3 3.15 3.15 0 000-6.3zm5.18-2.07a1.16 1.16 0 110 2.32 1.16 1.16 0 010-2.32z" /></svg>;
  }
  if (kind === 'twitter') {
    return <svg viewBox="0 0 24 24" {...common}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" {...common}><path d="M22 12a10 10 0 10-11.563 9.876v-6.987H7.898V12h2.539V9.798c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.889h-2.33v6.987A10 10 0 0022 12z" /></svg>;
};

export default function ContactWeb() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const STYLE_ID = 'dq-legal-scroll-fix';
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html, body { height: auto !important; min-height: 100% !important; overflow-y: auto !important; overflow-x: hidden !important; }
      #root, #root > div, #root > div > div, #root > div > div > div { height: auto !important; min-height: 100vh !important; overflow: visible !important; flex: none !important; display: block !important; }
      body { background: #F6FAFE; margin: 0; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(STYLE_ID)?.remove(); };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('dq-legal-fonts')) return;
    const link = document.createElement('link');
    link.id = 'dq-legal-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Manrope:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="contact-page" style={pageStyle}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="dq-legal__nav">
        <a href="/" className="dq-legal__back" data-testid="back-to-home">← Back to DEQUAD</a>
      </header>
      <main className="dq-legal dq-contact">
        <p className="dq-legal__kicker">CONTACT</p>
        <h1>Talk to us.</h1>
        <p className="dq-legal__updated">We answer every message — usually within 4 hours during UK working hours.</p>

        <div className="dq-contact__grid">
          <a className="dq-contact__card" href="mailto:quadri.yusuf@dequad.com" data-testid="contact-general">
            <Mail size={22} aria-hidden />
            <h3>General enquiries</h3>
            <p>quadri.yusuf@dequad.com</p>
          </a>
          <a className="dq-contact__card" href="mailto:quadri.yusuf@dequad.com" data-testid="contact-support">
            <MessageSquare size={22} aria-hidden />
            <h3>Student support</h3>
            <p>quadri.yusuf@dequad.com</p>
          </a>
          <a className="dq-contact__card" href="mailto:quadri.yusuf@dequad.com" data-testid="contact-privacy">
            <ShieldAlert size={22} aria-hidden />
            <h3>Privacy & data requests</h3>
            <p>quadri.yusuf@dequad.com</p>
          </a>
          <a className="dq-contact__card" href="mailto:quadri.yusuf@dequad.com" data-testid="contact-partnerships">
            <Mail size={22} aria-hidden />
            <h3>University & partnerships</h3>
            <p>quadri.yusuf@dequad.com</p>
          </a>
        </div>

        <h2>In an emergency</h2>
        <p>If you or someone you know is in crisis, please do not wait for us. Contact:</p>
        <ul>
          <li><strong>999</strong> — UK emergency services (or your local emergency number)</li>
          <li><strong>Samaritans — 116 123</strong> — free, 24/7</li>
          <li><strong>Shout — text 85258</strong> — free, 24/7 text support</li>
        </ul>

        <h2>Social</h2>
        <div className="dq-contact__social">
          <a href="https://www.instagram.com/dequadapp" target="_blank" rel="noopener noreferrer" data-testid="contact-instagram">
            <SocialIcon kind="instagram" /> Instagram <span>@dequadapp</span>
          </a>
        </div>

        <h2>Postal address</h2>
        <p>DEQUAD Ltd<br />
          [Registered UK address — added on incorporation]<br />
          United Kingdom</p>

        <footer className="dq-legal__footer">
          <a href="/" data-testid="legal-home-link">Home</a>
          <a href="/privacy" data-testid="legal-privacy-link">Privacy Policy</a>
          <a href="/terms" data-testid="legal-terms-link">Terms & Conditions</a>
        </footer>
      </main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, sans-serif',
  color: '#0F2942',
  background: '#F6FAFE',
  minHeight: '100vh',
};

const CSS = `
.dq-legal__nav { padding: 18px max(24px, calc((100vw - 880px) / 2)); border-bottom: 1px solid #DDE8F2; background: rgba(246,250,254,0.9); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50; }
.dq-legal__back { color: #0F2942; text-decoration: none; font-weight: 600; font-size: 14px; }
.dq-legal__back:hover { color: #5B9BD5; }
.dq-legal { max-width: 760px; margin: 0 auto; padding: 64px 24px 96px; line-height: 1.7; }
.dq-legal__kicker { font-size: 12px; font-weight: 700; letter-spacing: 0.22em; color: #4F6076; text-transform: uppercase; margin: 0 0 12px; }
.dq-legal h1 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(36px, 5vw, 56px); margin: 0 0 8px; letter-spacing: -0.02em; line-height: 1.05; }
.dq-legal__updated { color: #4F6076; font-size: 14px; margin: 0 0 48px; }
.dq-legal h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; margin: 40px 0 12px; }
.dq-legal p, .dq-legal li { font-size: 16px; color: #1F2A3A; }
.dq-legal ul { padding-left: 22px; }
.dq-legal li { margin: 6px 0; }
.dq-legal a { color: #5B9BD5; }
.dq-legal__footer { display: flex; gap: 24px; margin-top: 64px; padding-top: 32px; border-top: 1px solid #DDE8F2; font-size: 14px; }
.dq-legal__footer a { color: #4F6076; text-decoration: none; font-weight: 600; }
.dq-legal__footer a:hover { color: #0F2942; }
.dq-contact__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 32px 0 12px; }
.dq-contact__card { display: flex; flex-direction: column; gap: 6px; padding: 22px 24px; background: #FFFFFF; border: 1px solid #DDE8F2; border-radius: 18px; text-decoration: none; color: #0F2942; transition: transform 200ms ease, box-shadow 200ms ease; }
.dq-contact__card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -20px rgba(15,41,66,0.2); }
.dq-contact__card svg { color: #5B9BD5; }
.dq-contact__card h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin: 6px 0 0; }
.dq-contact__card p { margin: 0; font-size: 15px; color: #4F6076; }
.dq-contact__social { display: flex; flex-direction: column; gap: 10px; margin: 14px 0 8px; }
.dq-contact__social a { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; background: #FFFFFF; border: 1px solid #DDE8F2; border-radius: 12px; text-decoration: none; color: #0F2942; font-weight: 600; }
.dq-contact__social a svg { color: #5B9BD5; }
.dq-contact__social a span { color: #4F6076; font-weight: 400; margin-left: auto; }
.dq-contact__social a:hover { background: #EDF4FB; }
@media (max-width: 640px) {
  .dq-contact__grid { grid-template-columns: 1fr; }
}
`;
