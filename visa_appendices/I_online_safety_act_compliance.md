# Appendix I — Online Safety Act 2023 Compliance Opinion

**Subject of opinion:** DEQUAD (DEQUAD Ltd in formation), operated at https://dequad.co.uk
**Author of internal assessment:** Yusuf Quadri (Founder)
**External counsel of record:** [Law firm to be appointed — recommended panel: Bristows, Mishcon, Wiggin, Schillings]
**Date of latest review:** ___________________

---

## I.1 Purpose

This document is an internal compliance opinion summarising DEQUAD's position under the **Online Safety Act 2023** ("OSA") and is intended to demonstrate to UK Endorsement Services Ltd that the applicant has identified the obligations applicable to the business and has built the product with them in mind.

A signed external legal opinion from a UK-qualified solicitor in good standing will be commissioned during Month 2 post-endorsement and attached to this appendix at the next UKES contact point.

---

## I.2 Categorisation of DEQUAD under the OSA

| Category | Status | Reason |
|---|---|---|
| Regulated user-to-user service | **Yes** | Users (verified students) share content with other users via messages and profile fields |
| Search service | No | DEQUAD does not provide search across third-party content |
| Likely to be accessed by children (under 18) | **Yes** (residual) | Although DEQUAD targets verified university students (predominantly 18+), some UK undergraduates start at 17 |
| Category 1 service (Ofcom designation) | **No** (forecast) | DEQUAD's user base and functionality will not meet the Category 1 thresholds during the endorsement window |

**Practical implication:** DEQUAD is a **Category 2B-equivalent** user-to-user service with residual exposure to under-18 users. The applicable duties are summarised in §I.3.

---

## I.3 Applicable duties

| Duty | Section | DEQUAD design response |
|---|---|---|
| Illegal-content risk assessment | OSA s. 9, s. 10 | Completed; reviewed annually. See §I.4 below |
| Illegal-content safety duties | OSA s. 10 | Real-time keyword scanning + escalation to DSL; reporting flow built; takedown SLA defined |
| Children's risk assessment | OSA s. 11, s. 12 | Completed under assumption of residual under-18 access. See §I.5 |
| Children's safety duties | OSA s. 12 | High-risk safety setting default-on for all users; no algorithmic recommendation of strangers to flagged-under-18 accounts |
| Content-reporting and complaints procedures | OSA s. 17 | "Report a profile" feature live since 2026; complaints SLA 4 hours human triage |
| User empowerment (Cat 1 only) | OSA s. 14 | Not applicable (Cat 2B) |
| Freedom of expression / privacy | OSA s. 22 | DPIA documents necessity + proportionality of every safeguarding scan |
| Record-keeping | OSA s. 23 | All safeguarding events logged for 7 years; risk-assessment versions retained |
| Designated content moderator | OSA s. 56 | DSL appointed; backup DSL named |
| Ofcom information requests | OSA s. 100 | Process in place: 7-day response SLA |

---

## I.4 Illegal-content risk assessment summary

| Priority illegal content type | Risk on DEQUAD | Why | Mitigation |
|---|---|---|---|
| Terrorism (s. 59) | Very low | Closed UK university network; no anonymous posting; no public discoverability | Standard keyword scan + reporting flow |
| Child sexual abuse (CSAM) | Low | Verified `.ac.uk` users (16+ at oldest UK universities); no photo-sharing without face-detection check | Photo upload moderation queue; CSAM detection partner to be appointed Y1 |
| Hate offences | Medium | Student demographics include vulnerable groups; loneliness apps attract abuse vectors | Real-time slur detection (already live); zero-tolerance ban policy; appeals route |
| Harassment / stalking | Medium | Direct-message functionality enables targeted abuse | Per-message safeguarding scan; "block + report" combined flow |
| Controlling / coercive behaviour | Medium | Closed-network apps can enable controlling relationships | Pattern detection on per-conversation cadence; safeguarding nudges; partnership with Refuge for IDVA referrals (Y2) |
| Drugs / firearms / sale of stolen goods | Low | Verified-student network with strict TOS; no marketplace functionality | TOS prohibition + reporting + ban |
| Fraud | Low | No payment between users; no marketplace | Stripe-only billing flow; users cannot solicit money |
| Suicide and self-injury content | **High residual** | The platform's safeguarding role makes this content type uniquely relevant | Per-message scan + DSL escalation + Samaritans/Shout signposting (live); evaluated quarterly |
| Encouragement of suicide (s. 184 OSA) | High residual | As above | Active scanning; "encouragement" patterns distinct from "expression of distress" — DSL judges |
| Animal cruelty / extreme pornography | Very low | No mass-media upload; profile photos only | Profile-photo moderation queue |

The full Illegal Content Risk Assessment (ICRA) is kept on file and reviewed annually. Methodology aligns with Ofcom's **Online Safety: Illegal Harms Guidance** (December 2024).

---

## I.5 Children's risk assessment summary

DEQUAD is designed for verified UK university students. The platform's verification gate (active `.ac.uk` email) excludes the vast majority of under-18 users. However:

- A small number of UK undergraduate students begin their first year aged 17 (typically birthday-rule edge cases).
- Some Foundation-Year and Access course students at partner FE institutions may be 16+.

The Children's Risk Assessment therefore treats DEQUAD as a service with **residual exposure to under-18 users** and applies the corresponding precautions:

| Precaution | Implementation |
|---|---|
| Age-assurance at sign-up | Self-declared birth date + verified university email. Stronger age-verification under evaluation for Year 2 |
| Default privacy-protective settings for likely under-18 accounts | No discoverability via search; no exposure to adult users >5 years older without dual opt-in |
| Children's content-design code (ICO AADC) alignment | Designed in from launch: data minimisation, no profiling, no dark patterns |
| Education and reporting tools tailored for younger users | Plain-English help; one-tap "I need help" route to Childline (for under-18 self-identified users) |

---

## I.6 Designated roles and accountabilities

| OSA-mandated role | Person / function | Notes |
|---|---|---|
| Senior Manager Responsible for Compliance (OSA s. 56) | Yusuf Quadri, CEO (with Yusuff Adeagbo, CTO, as deputy) | Joint founder accountability documented in board minutes |
| Designated Safeguarding Lead | _To be appointed Month 1 post-endorsement_ | Job description in Appendix G |
| Data Protection Officer | _Outsourced fractional in Y1 (e.g. The DPO Centre, IT Governance); FTE in Y2_ | |
| Ofcom liaison point | Yusuf Quadri, CEO (Y1); transition to in-house counsel Y3 | |

---

## I.7 Engagement with the regulator (Ofcom)

| Activity | Status |
|---|---|
| Registered for Ofcom's small-platform information service | Pending Month 1 post-endorsement |
| Subscribed to Ofcom guidance updates | ✅ Live |
| Familiarity with Ofcom's Guidance for Smaller Providers (2025) | ✅ Reviewed |
| Plan for Ofcom transparency reports (if Cat 1 designation triggered) | Documented; no current Cat 1 forecast within endorsement window |

---

## I.8 External legal opinion — scope of work to be commissioned

The external legal opinion to be commissioned in Month 2 post-endorsement will cover:

1. Confirmation of DEQUAD's categorisation under the OSA;
2. Sufficiency of the Illegal Content and Children's Risk Assessments;
3. Sufficiency of the content-reporting and complaints procedures;
4. Adequacy of record-keeping;
5. Risk register for foreseeable Ofcom enforcement;
6. Boilerplate Terms of Service and Acceptable Use Policy review;
7. Confirmation that the founder's senior-manager-responsible accountability is appropriately recorded.

Estimated cost: **£8,000–£12,000** (firm fee dependent). Budgeted in Year-1 P&L (Appendix F).

---

## I.9 Statement

The applicant has read the Online Safety Act 2023 in full, has read the Ofcom illegal-content and children's-safety guidance, and has designed DEQUAD's product, processes, and policies to comply with the duties applicable to a Category 2B-equivalent user-to-user service. The applicant will obtain external legal confirmation of this position within the first six months of operation and will produce that opinion at the 6-month UKES contact point.

**Signed:** ___________________________________ **Yusuf Quadri**

**Date:** ___________________________________
