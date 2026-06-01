# Appendix F — UK GDPR & Data Protection Impact Assessment (DPIA)

**Submitted in support of:** Dequad — UK Innovator Founder Visa Application
**Data Controller:** Dequad Ltd (in formation), England & Wales
**Document version:** 1.0 — February 2026
**Review cadence:** Annually + on any material processing change
**Submitted as:** Appendix F of the Dequad UK Innovator Founder Visa Business Plan

> This appendix evidences Dequad's **UK GDPR + Data Protection Act 2018** compliance posture and provides the DPIA template Dequad will use for every UK university partnership engagement. It is built around the **ICO's DPIA framework** (March 2023 guidance).

---

## 1. Executive Summary

| Item | Status |
|------|--------|
| **Data Controller** | Dequad Ltd (in formation, to register with ICO within 30 days of incorporation) |
| **ICO Registration** | Planned within 30 days of incorporation; fee tier expected to be Tier 2 (£60/year) initially |
| **UK GDPR lawful basis** | Performance of contract (Art. 6(1)(b)) + Explicit consent (Art. 6(1)(a)) + Vital interests (Art. 6(1)(d)) for safeguarding only |
| **Special-category basis** | Explicit consent (Art. 9(2)(a)) + Vital interests (Art. 9(2)(c)) for safeguarding only |
| **Data residency** | UK / EU only (AWS London `eu-west-2` primary; AWS Ireland `eu-west-1` backup) |
| **International transfers** | None |
| **DPIA performed** | Yes (this document) — and per-university before each partnership |
| **DPO appointed** | Outsourced UK DPO firm from Year 1; in-house from Year 2 |
| **Data subject rights** | All UK GDPR rights honoured within 30 days |
| **Breach notification** | ICO within 72 hours per Art. 33; users informed without undue delay per Art. 34 |

---

## 2. Step 1 — Identify the Need for a DPIA

Per **ICO DPIA Guidance**, a DPIA is **required** where processing is "likely to result in a high risk to the rights and freedoms of individuals." Dequad's processing meets multiple ICO "high-risk" indicators:

| ICO indicator | Applies to Dequad? |
|---------------|---------------------|
| Processing of special-category data (mental health) | ✅ Yes |
| Processing relating to vulnerable individuals (students in distress) | ✅ Yes |
| Systematic monitoring (mood patterns, behavioural patterns) | ✅ Yes |
| Innovative use of technology (automated safeguarding detection) | ✅ Yes |
| Processing that could result in physical harm if compromised | ✅ Yes (safeguarding context) |

**Conclusion:** A DPIA is mandatory. This document is Dequad's master DPIA; per-university partnership DPIAs use this as the template.

---

## 3. Step 2 — Describe the Processing

### 3.1 Nature of the Processing

Dequad collects, stores, and analyses data from `.ac.uk`-verified UK university students to:
- Track daily mood and surface personalised wellbeing content
- Enable peer-to-peer connection through prompt-based matching and end-to-end encrypted chat
- Detect safeguarding concerns and alert designated university welfare leads
- Provide anonymised aggregate insights to partner university welfare teams

### 3.2 Categories of Personal Data Processed

| Data Category | Examples | Lawful Basis | Retention |
|---------------|----------|--------------|-----------|
| **Identity** | Name, university email, photo (optional) | Contract (Art. 6(1)(b)) | Account lifetime + 30 days |
| **Profile / Demographic** | University, course, year of study, interests, prompts | Contract | Account lifetime + 30 days |
| **Mood-tracking** | Daily score, free-text reflections | Explicit consent (Art. 9(2)(a)) | 24 months rolling |
| **Behavioural** | App-usage patterns, time-of-day activity | Legitimate interest (Art. 6(1)(f)) | 12 months |
| **Communications** | E2E-encrypted chat (server holds ciphertext only) | Contract | 90 days post-chat closure |
| **Safeguarding flags** | Category A/B/C incident records | Vital interests (Art. 6(1)(d) + Art. 9(2)(c)) | 7 years (audit) |
| **Device / technical** | Device model, OS version, IP for session security | Legitimate interest | 30 days |
| **Push tokens** | Expo push notification token | Consent | Until revoked |

### 3.3 Categories of Data Subject

- **Primary:** UK university students aged 18+, `.ac.uk` verified
- **Secondary (B2B):** University welfare team staff names + contact details (under DPA with their employing university)

### 3.4 Volume

| Year | Estimated Active UK Users |
|------|---------------------------|
| 1 | 50,000 |
| 2 | 150,000 |
| 3 | 300,000 |
| 5 | 750,000 |

### 3.5 Geographical Scope of Processing

- **Data subjects:** UK only (all users are `.ac.uk`-verified UK university students)
- **Processing location:** UK (AWS London `eu-west-2`)
- **Backup location:** EU (AWS Ireland `eu-west-1`)
- **International transfers outside UK/EU:** None

### 3.6 Data Sources

- Directly from the data subject (signup, in-app input, mood tracking)
- Via Google OAuth (verified identity from Google as Identity Provider) — IDP, not data broker
- Behavioural telemetry generated by user activity on the platform itself

### 3.7 Recipients of Personal Data

| Recipient | Data Shared | Lawful Basis |
|-----------|-------------|--------------|
| University Welfare Lead (partner university only) | Safeguarding alert details (Category A/B per protocol) | Vital interests + DPA |
| Dequad employees (DSL, Clinical Advisor, on-call officer) | Minimum necessary for incident handling | Contract + DPA with employer |
| Sub-processors (AWS, MongoDB Atlas, Expo, SMTP provider) | As required for service operation | Art. 28 DPAs signed |
| Law enforcement (police) | Only where lawfully required and on legal advice | Legal obligation |

### 3.8 Sub-Processors

| Sub-processor | Purpose | Location | Compliance |
|---------------|---------|----------|------------|
| **AWS** (eu-west-2 London) | Cloud hosting | UK | ICO-registered, ISO 27001, UK GDPR DPA in place |
| **MongoDB Atlas** | Database (UK region) | UK | UK GDPR DPA in place |
| **Expo Push** | Mobile push notifications | US (IDFA / token only — no personal data) | Standard Contractual Clauses + UK IDTA |
| **Google OAuth** | Identity provider | US (Google account info only) | Adequate; user consents at sign-in |
| **Email / SMTP provider** (SendGrid UK or Mailgun EU) | Safeguarding alert emails | UK / EU | UK GDPR DPA in place |

### 3.9 Retention Schedule (Summary)

| Data | Retention |
|------|-----------|
| Active account data | Account lifetime + 30 days post-deletion |
| Chat content | 90 days post-chat closure (encrypted at rest) |
| Mood data (individual) | 24 months rolling |
| Mood data (anonymised aggregate) | Indefinite (with consent) |
| Safeguarding incident audit log | 7 years (Art. 17(3)(b) — public-interest archiving for safeguarding) |
| Technical logs | 30 days |

---

## 4. Step 3 — Consultation Process

| Stakeholder | Consultation Approach |
|-------------|------------------------|
| **Data subjects (students)** | Plain-English privacy notice, granular consent screens, in-app DPO contact, student advisory feedback in beta |
| **University Welfare Leads** | Per-university DPIA workshop before pilot launch |
| **Clinical Advisor** | Reviews safeguarding data flows quarterly |
| **External DPO** | Reviews this DPIA annually + on material change |
| **UK ICO** (if needed) | Prior consultation under Art. 36 if any residual high risk after mitigation |

---

## 5. Step 4 — Assess Necessity & Proportionality

| Question | Answer |
|----------|--------|
| Is the processing necessary to achieve the stated purpose? | Yes — peer connection and safeguarding cannot be delivered without it |
| Is there a less intrusive alternative? | No — the proactive safeguarding outcome relies on the data flow described |
| Is the data minimised? | Yes — only fields required for each purpose are collected; mood reflections are user-initiated |
| Is processing proportionate to the benefit? | Yes — outweighed by demonstrable safeguarding outcome and student wellbeing benefits |
| Is consent freely given, informed, specific, unambiguous? | Yes — granular per-purpose consent in onboarding flow |
| Can users opt out? | Yes — every non-essential consent is independently revocable; account deletion is one-click |
| Are users fully informed (Art. 13 / 14)? | Yes — privacy notice covers all required information |

---

## 6. Step 5 — Identify & Assess Risks

| # | Risk | Likelihood | Severity | Inherent Risk |
|---|------|------------|----------|---------------|
| R1 | Unauthorised access to mood-tracking data | Low | High | **Medium-High** |
| R2 | Data breach exposing student identity + mental health data | Low | Severe | **High** |
| R3 | False-negative on a Category-A safeguarding alert | Low | Severe | **High** |
| R4 | False-positive safeguarding alert causing distress | Med | Low | **Low-Med** |
| R5 | Sub-processor breach (AWS / MongoDB) | Very Low | High | **Medium** |
| R6 | Cross-border transfer non-compliance | Very Low | Med | **Low** |
| R7 | Data subject unable to exercise UK GDPR rights | Low | Med | **Low-Med** |
| R8 | Excessive retention beyond stated periods | Low | Med | **Low** |
| R9 | Insider threat (Dequad employee misuse) | Low | High | **Medium** |
| R10 | Inadequate consent capture | Low | High | **Medium** |
| R11 | Failure to notify ICO within 72 hours | Low | High | **Medium** |
| R12 | Re-identification of "anonymised" aggregate data | Low | Med | **Low-Med** |

---

## 7. Step 6 — Identify Mitigations

| # | Risk | Mitigation | Residual Risk |
|---|------|------------|----------------|
| R1 | Mood data access | RBAC; access logs; field-level encryption at rest; principle of least privilege | **Low** |
| R2 | Breach of MH data | UK-region AWS only; encryption at rest (AES-256) + in transit (TLS 1.3); penetration testing annually; SOC 2 readiness Year 2; cyber insurance from Day 1 | **Low** |
| R3 | False negative | Multi-layered detection (keyword + pattern + self-report + peer-report); quarterly taxonomy review by Clinical Advisor; transparent honest disclosure that no system is perfect | **Low-Med** (residual accepted — disclosed) |
| R4 | False positive | Clinically-informed taxonomy; calibration via beta data; in-app messaging is gentle, signposting rather than alarming | **Low** |
| R5 | Sub-processor breach | Art. 28 DPAs in place; sub-processors are ISO 27001 / SOC 2 certified; sub-processor list maintained and reviewed annually | **Low** |
| R6 | Cross-border | No data exits UK/EU. Where Expo Push tokens cross to US, UK IDTA + SCCs in place; no personal data in token itself | **Very Low** |
| R7 | UK GDPR rights | Self-service SAR portal in app; dpo@dequad.app monitored daily; 30-day response SLA enforced | **Very Low** |
| R8 | Retention | Automated deletion jobs; retention enforced in code, not policy | **Very Low** |
| R9 | Insider threat | Background checks; access logging; quarterly access reviews; MHFA training + ethics training | **Low** |
| R10 | Consent capture | Granular, plain-English screens; no dark patterns; consent records timestamped and stored | **Low** |
| R11 | Breach notification | Documented runbook; on-call rotation includes legal escalation path | **Low** |
| R12 | Re-identification | Aggregation thresholds (no metric shown for groups < 10); k-anonymity in dashboards; differential-privacy roadmap Year 2 | **Low** |

---

## 8. Step 7 — Sign Off & Record Outcomes

| Step | Outcome | Owner | Date |
|------|---------|-------|------|
| Measures approved by | [Founder / DSL] | [Founder] | _____________ |
| Residual risks approved by | [DPO] | [External DPO] | _____________ |
| DPO advice provided | Yes — see commentary below | [External DPO] | _____________ |
| Consultation responses reviewed by | [DSL] | [Founder] | _____________ |
| This DPIA will be kept under review by | [DPO] | [External DPO] | Annually |

### 8.1 DPO Advice (to be filled by external DPO)

[Independent commentary from the appointed DPO. Standard expected outcome: "Subject to the mitigations in §7 being implemented in full and audited annually, the residual risk is acceptable. No prior ICO consultation under Art. 36 is required."]

### 8.2 Trigger for Re-Assessment

This DPIA must be re-assessed when any of the following occur:
- New category of personal data is processed
- New sub-processor is engaged
- Material change to the safeguarding taxonomy
- A material data breach occurs
- A material UK regulatory change (ICO / OfS / DPA)
- Annually, irrespective of changes

---

## 9. Per-University DPIA Template (Short Form)

For each UK university partnership, Dequad will produce a **short-form DPIA** building on this master DPIA. The short form covers:

1. **University name & registered Data Controller status**
2. **Specific welfare lead(s) named in the DPA**
3. **Number of students in scope**
4. **Any university-specific data fields** (e.g., student ID format)
5. **University-specific retention overrides** (if any)
6. **University-specific incident escalation contact tree**
7. **Sub-processor list shared with university DPO**
8. **Signed DPA between Dequad (Data Processor) and University (Data Controller) for the university's own data subjects**

This short form is reviewed and signed by both the university's DPO and Dequad's DPO before any production data flows.

---

## 10. Privacy Notice (Plain-English User-Facing)

Dequad's user-facing Privacy Notice — provided to every user at signup — covers all UK GDPR Art. 13 information:

- Who we are + how to contact us + DPO contact
- What data we collect
- Why we collect it (purposes)
- Lawful basis for each purpose
- Who we share it with
- How long we keep it
- Your rights under UK GDPR (access, rectification, erasure, portability, restriction, objection, withdraw consent)
- Right to complain to the ICO
- How we make automated decisions (and your right not to be subject to solely-automated decisions with legal effect — Art. 22)
- International transfers (none)

The full Privacy Notice is maintained at **dequad.app/privacy** and versioned.

---

## 11. ICO Registration Plan

| Step | Action | Timing |
|------|--------|--------|
| 1 | Incorporate Dequad Ltd at Companies House | Month 1 |
| 2 | Open business bank account | Month 1 |
| 3 | Register as Data Controller with the ICO (Tier 2 expected) | Within 30 days of incorporation |
| 4 | Appoint external DPO | Month 1 |
| 5 | Submit this DPIA to DPO for sign-off | Month 1 |
| 6 | Publish Privacy Notice + Cookie Notice + Acceptable Use Policy | Before public launch |
| 7 | NHS Digital DTAC application | Year 1 |
| 8 | ISO 27001 readiness assessment | Year 2 |

---

## 12. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Data Controller / CEO | [Founder Full Legal Name] | _________________ | __________ |
| External DPO | [DPO firm name + lead consultant] | _________________ | __________ |
| Clinical Advisor (for safeguarding data flows) | [Clinical Advisor Name, registration number] | _________________ | __________ |

---

*Document version 1.0 — February 2026. Confidential — Dequad Ltd / [Founder Name] — for UK Innovator Founder Visa endorsement use and ICO / partner DPO review.*
