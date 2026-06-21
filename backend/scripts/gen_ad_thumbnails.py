"""Generate 6 thumbnail / cover frames for the DEQUAD ad pack via Gemini Nano
Banana. These are the first-frame thumbnails that appear in TikTok / Instagram
Reels feed grids and as ad covers.

Each thumbnail is composed for 9:16 vertical viewing — subject and the bold
on-thumbnail text live in the centre band so the image crops cleanly to both
1:1 (Instagram feed) and 9:16 (TikTok / Reels) when needed.

Run with:  cd /app/backend && python scripts/gen_ad_thumbnails.py
"""
import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

OUT_DIR = Path(__file__).resolve().parent.parent.parent / "marketing" / "ad_thumbnails"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"


THUMBNAILS = [
    (
        "01_everyones_fine.png",
        """Vertical 9:16 portrait photograph for a TikTok/Reels ad thumbnail.
A young British university student (early 20s, Black male, fade haircut, hoodie)
sitting alone in the driver's seat of a parked car at night, head leaning
forward against the steering wheel. The car's interior is lit only by the
phone in his lap — cool blue glow on his face and the dashboard. Through the
windscreen, a blurred orange streetlamp.
Color grade: deep navy and electric blue shadows, single warm orange highlight.
Cinematic, moody, melancholic, shot on Arri Alexa, shallow depth of field, 50mm.
Composition: subject head positioned in the upper third so big bold text reading
"i'm fine." can be placed across the lower band of the image — leave that space
visually empty of detail. NO text or watermarks rendered in the image itself.""",
    ),
    (
        "02_five_confessions.png",
        """Vertical 9:16 portrait studio photograph. Five young British university
students (diverse — 2 female, 3 male, mix of South-Asian, Black, White, East-
Asian heritages), early 20s, lined up against a pure black studio backdrop.
All five faces are looking directly into camera, neutral expressions, single
soft key light from above creating Rembrandt-style shadows. They are spaced
evenly across the frame, shoulders just touching. Wardrobe: warm earth tones —
beige knitwear, mustard hoodie, deep green tee, charcoal jumper, cream cardigan.
Background: pure matte black.
Composition: their faces are vertically centred; ample empty black space above
and below for text overlays "5 things you don't say out loud".
Editorial portraiture, 85mm, dramatic chiaroscuro. NO text, NO watermarks.""",
    ),
    (
        "03_first_week_pov.png",
        """Vertical 9:16 portrait POV photograph. Looking down at a young
British university student's lap and hands. He's holding an iPhone showing the
home screen on a dimly lit bed in a student halls room. His hoodie sleeves and
hands are visible at the bottom of the frame. Behind the phone, slightly out
of focus, are an unmade single bed, a half-eaten takeaway box on the floor, a
desk lamp casting warm tungsten light. A poster of a UK indie band is on the
wall in the soft background blur.
Mood: lonely, late-night, scroll-zombie energy. Color grade: warm tungsten
on the room, blue glow from the phone.
Composition: phone vertically centred at chest height, leaving headroom for
the "POV: First week at uni" hook text overlay across the top.
Authentic teen-bedroom realism, no styling. 35mm, shallow depth of field.
NO text or watermarks.""",
    ),
    (
        "04_anti_dating_apps.png",
        """Vertical 9:16 portrait fashion-editorial photograph. A young British
female university student (early 20s, East-Asian heritage, dark bob haircut,
oversized cream blazer over a tee) staring directly into camera with a wry,
unimpressed half-smile. She's holding her smartphone out away from her body
with two fingers as if it smells bad. The background is a soft gradient of
muted lavender to dusty pink.
Color grade: pastel, soft, lifted shadows. Mood: confident, sardonic, "you
can't sell me to a creep" energy.
Composition: subject face in upper third, phone in middle third, lots of
negative space in lower third for a punchy headline "No bots. No randoms.".
Vogue-style editorial, 50mm, soft golden-hour key light. NO text, NO
watermarks.""",
    ),
    (
        "05_day_in_my_life.png",
        """Vertical 9:16 portrait lifestyle photograph. Two young British female
university students (one South-Asian with long black hair, one Mixed-race with
braids) sitting opposite each other at a small wooden cafe table, both with
their laptops open, takeaway flat-white coffees between them, mid-laugh at
something on one of the screens. Natural daylight streaming in from a large
window behind them — golden, warm, soft. The cafe interior has plants and
exposed brick.
Mood: warm, hopeful, body-doubling-energy, "we got this together".
Composition: subjects centred in mid-frame, the cafe window blowing out
slightly behind them creating a halo. Lots of negative space top and bottom
for "day in my life as a final year on the edge" text.
35mm, Fujifilm-style colour science, candid not posed, shallow depth of field.
NO text, NO watermarks.""",
    ),
    (
        "06_founders.png",
        """Vertical 9:16 portrait editorial photograph. Two young British male
co-founders (early-to-mid 20s, both Black — one with a fade haircut wearing a
forest green hoodie, the other with twists wearing a black bomber jacket over
a white tee) standing side by side on a UK university campus quad at golden
hour. The sandstone walls of a historic university building are softly out of
focus behind them. They look directly into camera with quiet confidence — no
forced smiles, no startup-bro posing — just steady, honest eye contact.
Mood: founder-portrait, NatWest-Accelerator-cohort vibes, serious but warm.
Color grade: warm golden hour highlights, soft navy shadows, natural skin
tones.
Composition: both founders centred chest-up, generous sky/quad space above for
"Why we built DEQUAD" text overlay across the top.
85mm portrait lens, shallow depth of field, shot on Fujifilm GFX, editorial
magazine quality. NO text, NO watermarks.""",
    ),
]


async def main() -> None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from /app/backend/.env")

    print(f"Generating {len(THUMBNAILS)} ad thumbnails → {OUT_DIR}")

    for idx, (filename, prompt) in enumerate(THUMBNAILS, 1):
        chat = (
            LlmChat(
                api_key=api_key,
                session_id=f"dequad-ad-thumb-{idx}",
                system_message=(
                    "You are a senior art director at a contemporary creative "
                    "advertising agency producing thumbnails for short-form "
                    "video campaigns. You produce cinematic, editorial-grade "
                    "imagery, never generic stock. Render exactly what is "
                    "described — no embellishment, no in-image text."
                ),
            )
            .with_model("gemini", MODEL)
            .with_params(modalities=["image", "text"])
        )

        msg = UserMessage(text=prompt)
        print(f"[{idx}/{len(THUMBNAILS)}] {filename} …", flush=True)
        try:
            _text, images = await chat.send_message_multimodal_response(msg)
        except Exception as e:
            print(f"  ✗ FAILED: {type(e).__name__}: {e}")
            continue

        if not images:
            print("  ✗ no image returned")
            continue

        img_bytes = base64.b64decode(images[0]["data"])
        out_path = OUT_DIR / filename
        out_path.write_bytes(img_bytes)
        print(f"  ✓ saved ({len(img_bytes) // 1024} KB)")

    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
