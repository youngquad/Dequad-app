# DEQUAD Ad Thumbnails — `/app/marketing/ad_thumbnails/`

Six AI-generated cover frames (Gemini Nano Banana) for the DEQUAD content-marketing ad pack. Each pairs with one of the 5 ads + the founder story Reel.

**Format**: vertical portrait, ~1024×1536 PNG (works as 9:16 TikTok cover and 1:1 Instagram square once you add the text overlay).

**Important**: these are **base images** — they contain NO text by design. Add the headline copy in CapCut, Figma or Canva before posting. The composition leaves negative space at top OR bottom for your headline.

---

## 📁 File index

| File | Pairs with | Headline to overlay |
|---|---|---|
| `01_everyones_fine.png` | Ad 1 (Everyone's fine until they're not) | **"i'm fine."** (massive, lower band) |
| `02_five_confessions.png` | Ad 2 (5 things you don't say out loud) | **"5 things you don't say out loud"** (top band, then numbered list overlay) |
| `03_first_week_pov.png` | Ad 3 (POV first week at uni) | **"POV: First week at uni…"** (top band) |
| `04_anti_dating_apps.png` | Ad 4 (anti-dating-app) | **"No bots. No randoms."** (lower third) |
| `05_day_in_my_life.png` | Ad 5 (Day in my life — final year) | **"day in my life as a final year on the edge"** (top band, lowercase like a TikTok diary) |
| `06_founders.png` | Founder Story Reel (90s) | **"Why we built DEQUAD"** (top band) |

---

## 🎨 How to add the text overlay

### In CapCut (free, recommended)
1. Open the PNG as a static layer
2. Add Text → use **Inter Black** or **Anton** font (free in CapCut)
3. Size: ~14% of frame height for hooks
4. Colour: pure white with a 4px black outline OR drop shadow at 50% opacity
5. Position: match the "headline" position from the table above
6. Export as JPG/PNG for static post, or as 1-second video for video cover

### In Figma (better for brand consistency)
1. New file → frame size 1080×1920 (9:16 TikTok) or 1080×1080 (1:1 IG)
2. Drop the PNG in as fill
3. Add text frame on top, use **DEQUAD brand colours**:
   - Background pill: navy `#0F2942`
   - Main text: white `#FFFFFF`
   - Accent underline: teal `#4FB89F`

---

## ♻️ Regenerating

To regenerate any thumbnail (e.g. you want a different actor, or want to A/B test a hook):

```bash
cd /app/backend
# Edit /app/backend/scripts/gen_ad_thumbnails.py — change the prompt for the
# entry you want to re-roll, then:
python scripts/gen_ad_thumbnails.py
```

Tip: keep 2–3 variants of each by saving as `01_everyones_fine_v2.png` etc., then A/B test which thumbnail gets more taps in your TikTok analytics.

---

## 📊 Best practices learned from UK student-app TikTok ads (2025)

- **Faces > text** in the first frame. Thumbnails with a face get ~2× tap-through vs text-only.
- **Direct eye contact** outperforms looking-away (Confessions ad concept).
- **One emotional word** ("lonely", "fine", "tired") outperforms full sentences in the cover.
- **Avoid stock-looking photography** — Nano Banana's editorial style with Rembrandt lighting is your friend.
- **Match the actor demographic** to your highest-converting uni audience. For Bedfordshire pilot users, the Black + South-Asian-heavy cast is intentional and reflects your real campus.
