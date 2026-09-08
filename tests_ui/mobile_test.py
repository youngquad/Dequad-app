import asyncio, sys
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"
EMAIL, PW = "ui.tester@student.beds.ac.uk", "UiTester123!"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                                  user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
        await page.wait_for_timeout(2000)
        await page.get_by_placeholder("Email address").fill(EMAIL)
        await page.get_by_placeholder("Password", exact=True).fill(PW)
        await page.screenshot(path="/app/tests_ui/m_login.png")
        await page.get_by_text("Sign In", exact=True).click()
        try:
            await page.wait_for_url("**/mood**", timeout=45000)
        except Exception as e:
            await page.screenshot(path="/app/tests_ui/m_login_fail.png")
            print("login failed url:", page.url, "body:", (await page.locator("body").inner_text())[:400]); raise
        print("logged in, url:", page.url)
        await page.wait_for_timeout(2500)
        await page.screenshot(path="/app/tests_ui/m_mood.png")
        # Connect
        await page.goto(f"{URL}/(main)/matches", wait_until="networkidle")
        await page.wait_for_timeout(4000)
        carousels = await page.locator('[data-testid^="photo-carousel-"]').count()
        print("carousels rendered:", carousels)
        first = page.locator('[data-testid^="photo-carousel-"]').first
        tid = await first.get_attribute("data-testid")
        uid = tid.replace("photo-carousel-", "")
        print("first card uid:", uid)
        nxt = page.locator(f'[data-testid="photo-next-{uid}"]')
        print("next arrow visible:", await nxt.count())
        names_before = await page.locator("text=About me").count()
        await page.screenshot(path="/app/tests_ui/m_connect.png")
        # measure card fills space: check bottom of card vs viewport
        box = await first.bounding_box()
        print("photo box:", box)
        # skip -> should advance immediately
        skip = page.locator('[data-testid="floating-skip-button"]')
        fb = await skip.bounding_box(); print("floating skip box:", fb)
        await skip.click()
        await page.wait_for_timeout(700)
        first2 = page.locator('[data-testid^="photo-carousel-"]')
        ids = [await first2.nth(i).get_attribute("data-testid") for i in range(await first2.count())]
        print("cards after skip:", len(ids), "first still same?", ids and ids[0] == tid)
        # visible card: find which carousel is within viewport
        for i in range(await first2.count()):
            bb = await first2.nth(i).bounding_box()
            if bb and 0 <= bb["x"] < 390:
                print("visible card now:", ids[i])
        await page.screenshot(path="/app/tests_ui/m_after_skip.png")
        # Chat list
        await page.goto(f"{URL}/(main)/chat", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="/app/tests_ui/m_chat.png")
        rows = await page.locator("text=/Tap to start|You:/").count()
        print("chat rows hint:", rows)
        print("JS errors:", [e for e in errors if "Warning" not in e][:5])
        await b.close()

asyncio.run(main())
