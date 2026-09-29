import asyncio, subprocess, json, os
from playwright.async_api import async_playwright

URL = "https://review-extractor-2.preview.emergentagent.com"

def admin_token():
    out = subprocess.check_output(["curl", "-s", "-X", "POST", f"{URL}/api/auth/admin-login", "-H", "Content-Type: application/json",
        "-d", json.dumps({"email": "quadri.yusuf@dequad.com", "password": "Oluwatobi11@", "admin_code": "DEQUAD_ADMIN_2024"})])
    return json.loads(out)["session_token"]

def create_licence(tok):
    out = subprocess.check_output(["curl", "-s", "-X", "POST", f"{URL}/api/admin/university-licences", "-H", f"Authorization: Bearer {tok}",
        "-H", "Content-Type: application/json", "-d", json.dumps({"name": "University of Manchester", "domains": ["manchester.ac.uk"], "active": True})])
    return json.loads(out)["id"]

def delete_licence(tok, lid):
    subprocess.check_output(["curl", "-s", "-X", "DELETE", f"{URL}/api/admin/university-licences/{lid}", "-H", f"Authorization: Bearer {tok}"])

async def main():
    tok = admin_token()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1280, "height": 800})
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(f"{URL}/(auth)/university-admin-login", wait_until="networkidle", timeout=120000)
        await page.wait_for_timeout(1500)
        inputs = page.locator("input")
        await inputs.nth(0).fill("admin@manchesteruni.edu")
        await inputs.nth(1).fill("UniAdmin123!")
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(1500)
        if await page.locator('[data-testid="university-licence-card"]').count() == 0:
            btn = page.get_by_text("Sign In", exact=False).first
            if await btn.count(): await btn.click()
        await page.wait_for_selector('[data-testid="university-licence-card"]', timeout=30000)
        print("url:", page.url)
        print("status (no licence):", await page.locator('[data-testid="university-licence-status"]').inner_text())
        lid = create_licence(tok)
        try:
            await page.reload(wait_until="networkidle")
            await page.wait_for_selector('[data-testid="university-licence-card"]', timeout=30000)
            print("status (licensed):", await page.locator('[data-testid="university-licence-status"]').inner_text())
            await page.screenshot(path="/app/tests_ui/uni_licence.png")
        finally:
            delete_licence(tok, lid)
        print("errors:", errors[:3])
        await b.close()
asyncio.run(main())
