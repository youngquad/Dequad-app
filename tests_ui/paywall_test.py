import asyncio, subprocess, json
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
        await page.wait_for_timeout(3500)
        print("paywall visible:", await page.locator('[data-testid="paywall-screen"]').count())
        print("paywall title:", await page.locator('[data-testid="paywall-title"]').inner_text())
        print("lock badges:", await page.locator('[data-testid^="tab-lock-"]').count())
        await page.screenshot(path="/app/tests_ui/pw_mood_locked.png")
        await page.locator('[data-testid="paywall-upgrade-button"]').click()
        await page.wait_for_timeout(2500)
        print("on subscription page:", "subscription" in page.url, page.url)
        print("errors:", errors[:3])
        await b.close()
asyncio.run(main())
