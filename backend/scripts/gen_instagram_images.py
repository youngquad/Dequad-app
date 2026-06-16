"""One-off script: generate 5 Instagram marketing images for DEQUAD using
Gemini Nano Banana. Run with: `python scripts/gen_instagram_images.py`.

Brand palette baked into each prompt:
- Soft blue background  #F6FAFE
- Navy text             #0F2942
- Brand blue            #5B9BD5
- Teal accent           #4FB89F
"""
import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

OUT_DIR = Path(__file__).resolve().parent.parent.parent / "marketing" / "instagram"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"

# Each entry: (filename, prompt). Prompts are intentionally detailed — Nano
# Banana follows specific compositional guidance well.
POSTS = [
    (
        "01_painpoint.png",
        """Square 1:1 Instagram photograph, cinematic moody lighting.
A young female university student (early 20s, mixed-race, natural hair)
sitting alone on the edge of a single bed in a dimly-lit student dorm at night.
Her face is partially lit only by the cool blue glow of a smartphone she holds
in both hands. The room has minimalist student decor — a desk with books, a
plant, a string of warm fairy lights softly out of focus in the background.
Color grade: deep navy shadows, single cool blue highlight on her face.
Editorial photography style, shallow depth of field, 35mm, soft grain.
Composition: subject left third, negative space top-right for caption overlay.
NO text or watermarks in the image."""
    ),
    (
        "02_founder.png",
        """Square 1:1 Instagram graphic. Minimalist editorial layout on a soft
pale-blue background (#F6FAFE). Centred composition: a single hand-written
quote in a navy serif script style (color #0F2942) reading
"how are you? deserves a better answer than fine."
Small DEQUAD heart-shaped logo mark in the bottom-right corner — a friendly
mid-blue (#5B9BD5) heart silhouette with a tiny teal swoosh accent (#4FB89F)
under it. Lots of breathing room. Subtle paper-grain texture. Premium,
boutique startup aesthetic — feels like a Casper or Glossier brand card.
NO other text or watermarks."""
    ),
    (
        "03_stat.png",
        """Square 1:1 Instagram graphic, bold typographic poster style.
Pure deep-navy background (#0F2942). Massive white sans-serif numeral "1 in 4"
filling the upper half of the canvas — modern condensed display typeface,
ultra-bold weight. Below it in smaller white type the words
"UK students feel lonely every day".
Tiny teal underline accent (#4FB89F) beneath the words.
At the very bottom in small all-caps tracked-out white letters: "DEQUAD".
Style: brutalist editorial poster, magazine cover energy, high contrast,
generous negative space. NO other text or decoration."""
    ),
    (
        "04_community.png",
        """Square 1:1 Instagram lifestyle photograph. Bright, sunny outdoor
campus scene. Three young university students (diverse — one Black female,
one South-Asian male, one White female) sitting together on a grass quad,
laughing genuinely with takeaway coffee cups. They're casually dressed in
autumn fashion (oversized cardigans, jeans). A historic British university
building (sandstone, leaded windows) is softly blurred in the background.
Warm golden-hour light. Candid, authentic, NOT posed-stocky. Composition:
slightly low angle, students centred, leaves on the grass.
Color grade leans toward soft blue shadows and warm honey highlights.
Editorial lifestyle photography, 50mm, shallow depth of field.
NO text or watermarks."""
    ),
    (
        "05_launch.png",
        """Square 1:1 Instagram graphic. Soft pale-blue background (#F6FAFE).
Centred: a clean iPhone 15 mockup tilted slightly, showing the DEQUAD app
home screen — a friendly mid-blue (#5B9BD5) heart logo at the top with the
wordmark "DEQUAD" in navy below, and a single white card reading
"Welcome back, Maya" with a tiny teal mood-tracker bar chart underneath.
Above the phone, a small navy pill-shaped badge with white text reading
"EARLY ACCESS" — letterspacing wide, sans-serif, all caps.
Subtle blue blur orb decorations top-left and bottom-right.
Premium SaaS launch aesthetic — feels like a Linear or Notion launch post.
NO other text or watermarks."""
    ),
]


async def main() -> None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from /app/backend/.env")

    print(f"Generating {len(POSTS)} images → {OUT_DIR}")

    for idx, (filename, prompt) in enumerate(POSTS, 1):
        # Fresh chat per image to avoid history bleed between prompts.
        chat = (
            LlmChat(
                api_key=api_key,
                session_id=f"dequad-ig-{idx}",
                system_message="You are a senior brand-marketing art director.",
            )
            .with_model("gemini", MODEL)
            .with_params(modalities=["image", "text"])
        )

        msg = UserMessage(text=prompt)
        print(f"[{idx}/{len(POSTS)}] {filename} …", flush=True)
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
