/* Terms & Conditions — Web only. Loaded at /terms. */
import React, { useEffect } from 'react';

export default function TermsWeb() {
  // Same global scroll fix as privacy
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
    <div data-testid="terms-page" style={pageStyle}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="dq-legal__nav">
        <a href="/" className="dq-legal__back" data-testid="back-to-home">← Back to DEQUAD</a>
      </header>
      <main className="dq-legal">
        <p className="dq-legal__kicker">TERMS</p>
        <h1>Terms & Conditions</h1>
        <p className="dq-legal__updated">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <h2>1. Agreement</h2>
        <p>These Terms & Conditions ("Terms") form a binding agreement between you and DEQUAD Ltd ("DEQUAD", "we", "us"). By signing up for or using DEQUAD you confirm that you have read, understood, and agreed to these Terms.</p>

        <h2>2. Who can use DEQUAD</h2>
        <p>DEQUAD is available only to verified students of UK universities. You must:</p>
        <ul>
          <li>Be at least 16 years old.</li>
          <li>Hold a current and active <code>.ac.uk</code> email address issued by a recognised UK university.</li>
          <li>Provide accurate sign-up information.</li>
        </ul>
        <p>We may suspend or close any account that does not meet these requirements.</p>

        <h2>3. Your account</h2>
        <p>You are responsible for the activity on your account and for keeping your sign-in details secure. Notify us immediately if you suspect unauthorised access.</p>

        <h2>4. Acceptable use</h2>
        <p>To keep DEQUAD safe, you agree NOT to:</p>
        <ul>
          <li>Use the service for harassment, bullying, sexual misconduct, racism, hate speech, or illegal activity.</li>
          <li>Impersonate another person or misrepresent your university affiliation.</li>
          <li>Solicit money, romantic or sexual contact, or off-platform activity from other users.</li>
          <li>Scrape, reverse-engineer, or attempt to disrupt the service.</li>
          <li>Share, sell, or distribute another user's content or identity.</li>
        </ul>
        <p>Breaches may result in immediate account suspension, permanent ban, and where appropriate referral to your university and the police.</p>

        <h2>5. Safeguarding</h2>
        <p>DEQUAD operates a closed, safeguarded network. We scan in-app communications in real time for crisis language, harassment, and exploitation indicators. High-risk content may be reviewed by a trained safeguarding lead and, where there is a credible risk to life, escalated to your university's named safeguarding officer or emergency services. By using DEQUAD you acknowledge and accept this safeguarding model.</p>

        <h2>6. Content you post</h2>
        <p>You retain ownership of the content you create on DEQUAD. You grant DEQUAD a worldwide, royalty-free licence to host, store, scan, and display that content as required to operate the service. We will never use your content for advertising or sell it to third parties.</p>

        <h2>7. Reporting & moderation</h2>
        <p>You can report another user or content from inside the app. Reports are reviewed by a human moderator within 4 hours during operating hours. We may remove content and suspend accounts at our discretion to keep the community safe.</p>

        <h2>8. Fees</h2>
        <p>DEQUAD's core student features are free. We may introduce optional premium features in future; pricing and terms will be disclosed clearly before any payment.</p>

        <h2>9. Termination</h2>
        <p>You can close your account at any time from the Profile screen. We may suspend or terminate your account if you breach these Terms or if continued access risks the safety of other users. We will keep limited records (for example safeguarding records) for the periods explained in our Privacy Policy.</p>

        <h2>10. Disclaimers</h2>
        <p>DEQUAD is a peer-support and connection platform. It is <strong>not a clinical, medical, or counselling service</strong>. Nothing on DEQUAD constitutes medical, psychological, or legal advice. In an emergency, call <strong>999</strong> or your local emergency number, or contact <strong>Samaritans (116 123)</strong> or <strong>Shout (text 85258)</strong>.</p>

        <h2>11. Liability</h2>
        <p>To the maximum extent permitted by UK law, DEQUAD Ltd is not liable for indirect or consequential losses arising from your use of the service. Nothing in these Terms limits liability that cannot lawfully be limited.</p>

        <h2>12. Changes</h2>
        <p>We may update these Terms from time to time. Material changes will be notified at least 30 days before they take effect.</p>

        <h2>13. Governing law</h2>
        <p>These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

        <h2>14. Contact</h2>
        <p>Questions about these Terms? Email <a href="mailto:hello@dequad.co.uk">hello@dequad.co.uk</a>.</p>

        <footer className="dq-legal__footer">
          <a href="/" data-testid="legal-home-link">Home</a>
          <a href="/privacy" data-testid="legal-privacy-link">Privacy Policy</a>
          <a href="/contact" data-testid="legal-contact-link">Contact</a>
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
.dq-legal code { background: #EDF4FB; padding: 2px 8px; border-radius: 6px; font-size: 0.92em; }
.dq-legal__footer { display: flex; gap: 24px; margin-top: 64px; padding-top: 32px; border-top: 1px solid #DDE8F2; font-size: 14px; }
.dq-legal__footer a { color: #4F6076; text-decoration: none; font-weight: 600; }
.dq-legal__footer a:hover { color: #0F2942; }
`;
