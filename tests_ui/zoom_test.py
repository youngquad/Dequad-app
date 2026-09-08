import asyncio
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"
EMAIL, PW = "ui.tester@student.beds.ac.uk", "UiTester123!"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
        await page.wait_for_timeout(1500)
        await page.get_by_placeholder("Email address").fill(EMAIL)
        await page.get_by_placeholder("Password", exact=True).fill(PW)
        await page.get_by_text("Sign In", exact=True).click()
        await page.wait_for_url("**/mood**", timeout=45000)
        await page.goto(f"{URL}/(main)/matches", wait_until="networkidle")
        await page.wait_for_timeout(4000)
        car = page.locator('[data-testid^="photo-carousel-"]').first
        uid = (await car.get_attribute("data-testid")).replace("photo-carousel-", "")
        slide = page.locator(f'[data-testid="photo-slide-{uid}-0"]')
        print("slide found:", await slide.count())
        await slide.click()
        await page.wait_for_selector('[data-testid="photo-viewer"]', timeout=5000)
        print("viewer open:", await page.locator('[data-testid="photo-viewer"]').count())
        print("counter:", await page.locator('[data-testid="photo-viewer-counter"]').inner_text())
        await page.wait_for_timeout(1200)
        await page.screenshot(path="/app/tests_ui/z_open.png")
        await page.locator('[data-testid="photo-viewer-next"]').click()
        await page.wait_for_timeout(800)
        print("counter after next:", await page.locator('[data-testid="photo-viewer-counter"]').inner_text())
        img = page.locator('[data-testid="photo-viewer-image-1"]')
        before = await img.evaluate("el => getComputedStyle(el).transform")
        box = await img.bounding_box()
        await page.mouse.dblclick(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        await page.wait_for_timeout(900)
        after = await img.evaluate("el => getComputedStyle(el).transform")
        print("transform before:", before[:40], "| after dbl-tap:", after[:60])
        print("hint zoomed:", await page.get_by_text("Double-tap to reset").count())
        await page.screenshot(path="/app/tests_ui/z_zoomed.png")
        await page.mouse.dblclick(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        await page.wait_for_timeout(900)
        reset = await img.evaluate("el => getComputedStyle(el).transform")
        print("after reset:", reset[:60])
        await page.locator('[data-testid="photo-viewer-close"]').click()
        await page.wait_for_timeout(600)
        print("viewer closed:", await page.locator('[data-testid="photo-viewer"]').count() == 0)
        # card dots synced to photo 2
        dots = page.locator(f'[data-testid="photo-carousel-{uid}"]')
        print("card prev arrow now visible (synced to photo 2):", await page.locator(f'[data-testid="photo-prev-{uid}"]').count())
        await page.screenshot(path="/app/tests_ui/z_after.png")
        print("errors:", errors[:3])
        await b.close()
asyncio.run(main())
