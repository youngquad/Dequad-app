# UI: verify-email delivery feedback (bounce box / ok path / resend) + login regression
import asyncio, sys, uuid
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"
RID = uuid.uuid4().hex[:6]
MODE = sys.argv[1] if len(sys.argv) > 1 else "all"
results = {}


async def signup(page, email):
    await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
    await page.wait_for_timeout(1500)
    await page.get_by_text("Sign up", exact=True).click()
    await page.wait_for_timeout(500)
    await page.get_by_placeholder("Your name (optional)").fill("QA UI")
    await page.get_by_placeholder("Email address").fill(email)
    await page.get_by_placeholder("Create a password (8+ characters)").fill("QaTest123!")
    await page.wait_for_timeout(500)
    cb = page.get_by_text("I confirm I'm currently enrolled", exact=False)
    if await cb.count():
        await cb.first.click()
    await page.get_by_text("Create Account", exact=True).click()
    await page.wait_for_url("**/verify-email**", timeout=45000)
    await page.get_by_text("Check your inbox.").wait_for(timeout=15000)


async def bounce(ctx):
    page = await ctx.new_page(); errs = []
    page.on("pageerror", lambda e: errs.append(str(e)))
    email = f"qa.ui.bounce.{RID}@beds.ac.uk"
    try:
        email = sys.argv[2]
        await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
        await page.goto(f"{URL}/verify-email?email={email}", wait_until="networkidle", timeout=120000)
        await page.get_by_text("Check your inbox.").wait_for(timeout=15000)
        print("B url:", page.url)
        print("B testids:", await page.evaluate("() => [...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)"))
        await page.wait_for_selector('[data-testid="verify-delivery-failed"]', timeout=25000)
        box = await page.locator('[data-testid="verify-delivery-failed"]').inner_text()
        print("B box:", box)
        print("B msg:", await page.locator('[data-testid="verify-delivery-message"]').inner_text())
        print("B code inputs:", await page.locator('input').count())
        print("B cooldown visible:", await page.get_by_text("You can request a new code in").is_visible())
        await page.screenshot(path="/app/tests_ui/vd_bounce.png", quality=40, type="jpeg")
        await page.locator('[data-testid="verify-use-different-email"]').click()
        await page.wait_for_url("**/login**", timeout=15000)
        print("B after btn url:", page.url)
        results["bounce"] = "Email could not be delivered" in box
    except Exception as e:
        print("B FAIL:", e); await page.screenshot(path="/app/tests_ui/vd_bounce_fail.png", quality=40, type="jpeg")
        results["bounce"] = False
    print("B errors:", errs[:3])


async def ok(ctx):
    page = await ctx.new_page(); errs = []
    page.on("pageerror", lambda e: errs.append(str(e)))
    email = f"qa.ui.ok.{RID}@student.leeds.ac.uk"
    try:
        await signup(page, email)
        await page.wait_for_timeout(25000)
        failed = await page.locator('[data-testid="verify-delivery-failed"]').count()
        okl = await page.locator('[data-testid="verify-delivery-ok"]').count()
        print("O inputs:", await page.locator('input').count(), "cooldown:", await page.get_by_text("You can request a new code in").is_visible())
        print("O failed box count:", failed, "ok line count:", okl)
        await page.screenshot(path="/app/tests_ui/vd_ok.png", quality=40, type="jpeg")
        await page.get_by_text("Didn't get it? Resend code").wait_for(timeout=50000)
        await page.get_by_text("Didn't get it? Resend code").click()
        await page.get_by_text("A new code is on its way").or_(page.get_by_text("Please wait")).first.wait_for(timeout=15000)
        print("O info ok")
        print("O cooldown back:", await page.get_by_text("You can request a new code in").is_visible())
        await page.wait_for_timeout(10000)
        print("O failed after resend:", await page.locator('[data-testid="verify-delivery-failed"]').count())
        await page.screenshot(path="/app/tests_ui/vd_ok_resend.png", quality=40, type="jpeg")
        results["ok"] = failed == 0
    except Exception as e:
        print("O FAIL:", e); await page.screenshot(path="/app/tests_ui/vd_ok_fail.png", quality=40, type="jpeg")
        results["ok"] = False
    print("O errors:", errs[:3])


async def login(ctx):
    page = await ctx.new_page()
    try:
        await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
        await page.wait_for_timeout(1500)
        await page.get_by_placeholder("Email address").fill("ui.tester@student.beds.ac.uk")
        await page.get_by_placeholder("Password", exact=True).fill("UiTester123!")
        await page.get_by_text("Sign In", exact=True).click()
        await page.wait_for_url("**/mood**", timeout=45000)
        print("L url:", page.url); results["login"] = True
    except Exception as e:
        print("L FAIL:", e); results["login"] = False


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        mk = lambda: b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        if MODE in ("all", "bounce"):
            await bounce(await mk())
        if MODE in ("all", "ok"):
            await ok(await mk())
        if MODE in ("all", "login"):
            await login(await mk())
        print("RESULTS:", results)
        await b.close()

asyncio.run(main())
