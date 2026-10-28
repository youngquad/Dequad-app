# Iter18: verify-email header hidden, testID->data-testid hooks, bounce box regression
import asyncio, uuid
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"
EMAIL = f"qa.retest.{uuid.uuid4().hex[:6]}@beds.ac.uk"
R = {}


async def tids(page):
    return await page.evaluate("() => [...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)")


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = await ctx.new_page(); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        # 1) header check
        try:
            await page.goto(f"{URL}/verify-email?email=someone@student.leeds.ac.uk", wait_until="networkidle", timeout=120000)
            await page.wait_for_timeout(2500)
            await page.screenshot(path="/app/tests_ui/it18_verify_header.png", quality=40, type="jpeg")
            hdr = await page.evaluate("""() => [...document.querySelectorAll('*')].filter(e => e.children.length===0 && e.textContent.trim()==='verify-email' && e.offsetParent!==null).length""")
            t = await tids(page)
            print("1 visible 'verify-email' text nodes:", hdr)
            print("1 testids:", t)
            need = ["verify-title", "verify-cooldown-timer", "verify-submit", "verify-back"] + [f"verify-code-{i}" for i in range(6)]
            miss = [x for x in need if x not in t]
            print("1 missing:", miss)
            R["no_header"] = hdr == 0
            R["verify_testids"] = not miss
        except Exception as e:
            print("1 FAIL", e); R["no_header"] = False
        # 2) login testids
        try:
            await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
            await page.wait_for_timeout(1500)
            t = await tids(page); print("2 login testids:", t)
            ok = "auth-mode-toggle" in t and "auth-submit" in t
            await page.locator('[data-testid="auth-mode-toggle"]').first.click()
            await page.wait_for_timeout(700)
            await page.get_by_placeholder("Email address").fill(EMAIL)
            await page.wait_for_timeout(700)
            t2 = await tids(page); print("2 signup testids:", t2)
            R["login_testids"] = ok and "auth-confirm-student" in t2
            # 3) bounce flow
            await page.get_by_placeholder("Your name (optional)").fill("QA Retest")
            await page.get_by_placeholder("Create a password (8+ characters)").fill("QaTest123!")
            await page.locator('[data-testid="auth-confirm-student"]').click()
            await page.locator('[data-testid="auth-submit"]').click()
            await page.wait_for_url("**/verify-email**", timeout=45000)
            print("3 url:", page.url)
            await page.wait_for_selector('[data-testid="verify-delivery-failed"]', timeout=30000)
            print("3 box:", await page.locator('[data-testid="verify-delivery-failed"]').inner_text())
            print("3 msg:", await page.locator('[data-testid="verify-delivery-message"]').inner_text())
            await page.screenshot(path="/app/tests_ui/it18_bounce.png", quality=40, type="jpeg")
            await page.locator('[data-testid="verify-use-different-email"]').click()
            await page.wait_for_url("**/login**", timeout=15000)
            print("3 after:", page.url); R["bounce"] = True
        except Exception as e:
            print("2/3 FAIL", e); R.setdefault("bounce", False)
            await page.screenshot(path="/app/tests_ui/it18_fail.png", quality=40, type="jpeg")
        print("EMAIL:", EMAIL); print("PAGE ERRORS:", errs[:5]); print("RESULTS:", R)
        await b.close()

asyncio.run(main())
