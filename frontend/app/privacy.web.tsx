/* Privacy Policy — Web only. Loaded at /privacy. */
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function PrivacyWeb() {
  const router = useRouter();

  // Inject same global scroll-fix as the landing page
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

  // Inject fonts
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('dq-legal-fonts')) return;
    const link = document.createElement('link');
    link.id = 'dq-legal-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Manrope:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="privacy-page" style={pageStyle}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="dq-legal__nav">
        <a href="/" className="dq-legal__back" data-testid="back-to-home">← Back to DEQUAD</a>
      </header>
      <main className="dq-legal">
        <p className="dq-legal__kicker">PRIVACY</p>
        <h1>Privacy Policy</h1>
        <p className="dq-legal__updated">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <h2>1. Who we are</h2>
        <p>DEQUAD Ltd ("DEQUAD", "we", "us", "our") is a UK-registered company building a safeguarding-first peer-wellbeing platform for UK university students. We are the data controller of personal data processed through the DEQUAD service. You can contact us at <a href="mailto:quadri.yusuf@dequad.com">quadri.yusuf@dequad.com</a>.</p>

        <h2>2. The data we collect</h2>
        <p>When you use DEQUAD we collect:</p>
        <ul>
          <li><strong>Identity:</strong> your name, profile photo (optional), and university email (must be a verified <code>.ac.uk</code> address).</li>
          <li><strong>Profile preferences:</strong> course, modules, society interests, study habits — anything you choose to share for compatibility matching.</li>
          <li><strong>Wellbeing data (special category):</strong> daily mood scores and optional free-text notes.</li>
          <li><strong>Communications:</strong> the content of messages you send to other users and to DEQUAD Support.</li>
          <li><strong>Technical data:</strong> device type, IP address, and basic usage telemetry needed to operate the service.</li>
        </ul>

        <h2>3. Lawful basis</h2>
        <p>Under the UK GDPR we rely on the following lawful bases:</p>
        <ul>
          <li><strong>Performance of contract (Art 6.1.b)</strong> — to verify your university affiliation and provide peer matching.</li>
          <li><strong>Consent (Art 6.1.a) and explicit consent (Art 9.2.a)</strong> — to store and analyse your mood data.</li>
          <li><strong>Substantial public interest (Sch 1 Pt 2 para 18, DPA 2018)</strong> — to scan messages for safeguarding purposes and escalate high-risk content.</li>
          <li><strong>Legitimate interest (Art 6.1.f)</strong> — to keep the service secure and to anonymise aggregate data for research with our partner universities.</li>
        </ul>

        <h2>4. How we use your data</h2>
        <p>We use your data to: verify you are a UK university student; match you with compatible peers; log and analyse your daily wellbeing; scan messages for crisis or harassment indicators; escalate high-risk content to a trained safeguarding lead; respond to support requests; and operate the service securely. <strong>We never sell your data, and we never run advertising against it.</strong></p>

        <h2>5. Sharing with partner universities</h2>
        <p>If your university is a paying DEQUAD partner, we share with them only <strong>aggregated, anonymised metrics</strong> (e.g. "wellbeing dipped 8% during exam week"). We never share your individual mood, messages, profile, or identity with your university — unless a trained safeguarding lead determines that there is a credible risk to life, in which case we will escalate to your university's named safeguarding officer in line with our safeguarding protocol.</p>

        <h2>6. International transfers</h2>
        <p>Your data is stored on UK servers (MongoDB Atlas, London region). Limited categories of data — Stripe billing information and the redacted excerpts sent to our AI auto-reply service — are processed in the US under Standard Contractual Clauses 2021.</p>

        <h2>7. Retention</h2>
        <ul>
          <li>Active account data — for the duration of your account.</li>
          <li>After account deletion — most data is erased within 30 days. Safeguarding records are retained for 7 years to meet UK record-keeping obligations.</li>
          <li>Stripe billing records — retained for 7 years under HMRC rules.</li>
        </ul>

        <h2>8. Your rights</h2>
        <p>Under the UK GDPR you have the right to access, rectify, erase, restrict, port, or object to our processing of your personal data, and to withdraw consent at any time. You can exercise these rights inside the app (Profile → Privacy & Data) or by emailing <a href="mailto:quadri.yusuf@dequad.com">quadri.yusuf@dequad.com</a>. We will respond within one month. You can also complain to the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">Information Commissioner's Office (ICO)</a>.</p>

        <h2>9. Children</h2>
        <p>DEQUAD is designed for verified UK university students. A small number of first-year UK undergraduates may be under 18. For any account where we determine the user is under 18, we apply default privacy-protective settings in line with the ICO's Age-Appropriate Design Code.</p>

        <h2>10. Cookies</h2>
        <p>DEQUAD uses only essential cookies needed to keep you signed in and to operate the service securely. We do not use advertising or third-party tracking cookies.</p>

        <h2>11. Changes to this policy</h2>
        <p>We may update this policy from time to time. Material changes will be communicated by email and through a notice in the app at least 30 days before they take effect.</p>

        <h2>12. Contact</h2>
        <p>Questions or concerns? Email our Data Protection Officer at <a href="mailto:quadri.yusuf@dequad.com">quadri.yusuf@dequad.com</a> or write to:<br />
          DEQUAD Ltd, [Registered UK address], United Kingdom.</p>

        <footer className="dq-legal__footer">
          <a href="/" data-testid="legal-home-link">Home</a>
          <a href="/terms" data-testid="legal-terms-link">Terms & Conditions</a>
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
