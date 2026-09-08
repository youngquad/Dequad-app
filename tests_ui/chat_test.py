import asyncio, time
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"
EMAIL, PW = "emma.wilson@test.edu", "EmmaTest123!"
MATCH_ID = "d4b80d07-3234-4ba4-8519-6e6afb79eaee"

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
        print("logged in")
        await page.goto(f"{URL}/(main)/chat", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="/app/tests_ui/c_list.png")
        print("James row:", await page.get_by_text("James Chen").count())
        await page.get_by_text("James Chen").first.click()
        await page.wait_for_timeout(3500)
        # tab bar hidden in thread?
        print("tab 'Connect' label visible in thread:", await page.get_by_text("Connect", exact=True).count())
        msg = f"Smooth test {int(time.time())}"
        inp = page.get_by_placeholder("Type a message...")
        await inp.fill(msg)
        t0 = time.time()
        await page.locator("div,button").filter(has=page.locator("svg")).last.click(force=True) if False else None
        # send button is the last touchable next to input: press Enter fallback -> click by role
        send_btn = page.locator('[data-testid="chat-send-button"]')
        if await send_btn.count() == 0:
            # find via sibling: the button after the input
            send_btn = inp.locator("xpath=following-sibling::*[1]")
        await send_btn.click(force=True)
        # optimistic bubble should appear immediately (< 300ms)
        await page.wait_for_selector(f"text={msg}", timeout=1500)
        dt = (time.time() - t0) * 1000
        print(f"bubble visible after {dt:.0f} ms")
        print("input cleared:", (await inp.input_value()) == "")
        await page.screenshot(path="/app/tests_ui/c_sent.png")
        await page.wait_for_timeout(4000)
        print("still one bubble (no dup):", await page.get_by_text(msg).count())
        print("Sending… gone:", await page.get_by_text("Sending…").count() == 0)
        await page.screenshot(path="/app/tests_ui/c_after.png")
        print("errors:", errors[:3])
        await b.close()
asyncio.run(main())
