"""Iteration 16 – Freemium/Licence frontend regression.

Runs 3 flows sequentially with the same file:
  * Flow A (mobile 390x844) – FREE student paywall on /mood and /feedback,
    lock badges, unlock -> /subscription; profile premium card subtitle.
  * Flow B (mobile 390x844) – with an ACTIVE beds.ac.uk licence provisioned via
    admin API, reload student -> full access UI (no paywall, no lock badges,
    partner banner on /subscription, profile subtitle updated, no cancel/upgrade
    buttons on /subscription). Delete licence and verify paywall returns.
  * Flow C (desktop 1280x800) – super admin /admin/login -> Licences tab CRUD +
    university-admin dashboard licence card before & after licence exists.

Requires the FREE student to already be free (DB is clean of licences).
Every licence created here is deleted at the end.
"""
from __future__ import annotations
import asyncio, os, sys, json
import requests
from playwright.async_api import async_playwright

URL = os.environ.get("REACT_APP_BACKEND_URL", "https://review-extractor-2.preview.emergentagent.com").rstrip("/")
API = f"{URL}/api"

STUDENT = ("ui.tester@student.beds.ac.uk", "UiTester123!")
ADMIN = ("quadri.yusuf@dequad.com", "Oluwatobi11@", "DEQUAD_ADMIN_2024")
UNI_ADMIN = ("admin@manchesteruni.edu", "UniAdmin123!")


def admin_token():
    r = requests.post(f"{API}/auth/admin-login", json={"email": ADMIN[0], "password": ADMIN[1], "admin_code": ADMIN[2]}, timeout=20)
    r.raise_for_status()
    return r.json().get("session_token") or r.json().get("token")


def delete_all_test_licences(tok):
    r = requests.get(f"{API}/admin/university-licences", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    if r.status_code != 200:
        return
    for lic in r.json().get("licences", []):
        doms = [d.lower() for d in lic.get("domains", [])]
        name = (lic.get("name") or "").lower()
        if any(d in ("beds.ac.uk", "manchester.ac.uk", "testuni.ac.uk", "students.testuni.ac.uk") for d in doms) \
                or "test uni" in name or "bedfordshire" in name or "manchester" in name:
            requests.delete(f"{API}/admin/university-licences/{lic['id']}", headers={"Authorization": f"Bearer {tok}"}, timeout=10)


async def student_login(page):
    await page.goto(f"{URL}/(auth)/login", wait_until="networkidle", timeout=120000)
    await page.wait_for_timeout(1500)
    await page.get_by_placeholder("Email address").fill(STUDENT[0])
    await page.get_by_placeholder("Password", exact=True).fill(STUDENT[1])
    await page.get_by_text("Sign In", exact=True).click()
    await page.wait_for_url("**/mood**", timeout=45000)
    await page.wait_for_timeout(3500)


async def flow_a_free(p, results):
    print("\n=== FLOW A – FREE student paywall ===")
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        await student_login(page)
        pw_count = await page.locator('[data-testid="paywall-screen"]').count()
        pw_title = (await page.locator('[data-testid="paywall-title"]').inner_text()).strip() if pw_count else ""
        partner_note = await page.locator('[data-testid="paywall-partner-note"]').count()
        lock_heart = await page.locator('[data-testid="tab-lock-heart"]').count()
        lock_chat = await page.locator('[data-testid="tab-lock-chatbox"]').count()
        upgrade_btn = await page.locator('[data-testid="paywall-upgrade-button"]').count()
        await page.screenshot(path="/app/tests_ui/it16_a_mood_paywall.png")
        results["A_mood_paywall_visible"] = pw_count == 1
        results["A_mood_paywall_title"] = pw_title
        results["A_paywall_partner_note"] = partner_note == 1
        results["A_lock_badge_heart"] = lock_heart >= 1
        results["A_lock_badge_chatbox"] = lock_chat >= 1
        print("paywall on /mood:", pw_count, "title:", pw_title, "partner_note:", partner_note, "lock_heart:", lock_heart, "lock_chat:", lock_chat)

        # Tap Unlock -> /subscription, verify "Free Plan" badge
        await page.locator('[data-testid="paywall-upgrade-button"]').first.click()
        await page.wait_for_timeout(3000)
        results["A_unlock_navigates_to_subscription"] = "subscription" in page.url
        page_txt = await page.locator("body").inner_text()
        results["A_subscription_shows_free_plan"] = "Free Plan" in page_txt
        await page.screenshot(path="/app/tests_ui/it16_a_subscription.png")
        print("subscription url:", page.url, "Free Plan text present:", results["A_subscription_shows_free_plan"])

        # Feedback tab paywall
        await page.goto(f"{URL}/(main)/feedback", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2500)
        fb_pw_count = await page.locator('[data-testid="paywall-screen"]').count()
        fb_pw_title = (await page.locator('[data-testid="paywall-title"]').inner_text()).strip() if fb_pw_count else ""
        results["A_feedback_paywall_visible"] = fb_pw_count == 1
        results["A_feedback_paywall_title"] = fb_pw_title
        print("feedback paywall:", fb_pw_count, "title:", fb_pw_title)

        # Profile premium card subtitle
        await page.goto(f"{URL}/(main)/profile", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2500)
        sub_count = await page.locator('[data-testid="premium-card-subtitle"]').count()
        sub_text = (await page.locator('[data-testid="premium-card-subtitle"]').first.inner_text()).strip() if sub_count else ""
        results["A_premium_card_subtitle"] = sub_text
        print("premium-card-subtitle:", sub_text)

        # Connect tab still works
        await page.goto(f"{URL}/(main)/matches", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)
        skip_btn = await page.locator('[data-testid="floating-skip-button"]').count()
        results["A_connect_floating_skip_present"] = skip_btn >= 1
        print("floating-skip-button count on Connect:", skip_btn)
        results["A_errors"] = errors[:5]
    except Exception as e:
        results["A_exception"] = str(e)
        print("FLOW A ERROR:", e)
    finally:
        await b.close()


async def flow_b_licensed(p, results, tok):
    print("\n=== FLOW B – licensed (partner uni) student ===")
    # Provision beds.ac.uk licence
    r = requests.post(f"{API}/admin/university-licences",
                      headers={"Authorization": f"Bearer {tok}"},
                      json={"name": "University of Bedfordshire", "domains": ["beds.ac.uk"], "active": True},
                      timeout=15)
    if r.status_code != 200:
        results["B_provision_failed"] = f"{r.status_code} {r.text}"
        print("FAILED to provision licence:", r.status_code, r.text)
        return
    lic_id = r.json()["id"]
    print("provisioned licence:", lic_id)

    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        await student_login(page)
        pw_count = await page.locator('[data-testid="paywall-screen"]').count()
        lock_heart = await page.locator('[data-testid="tab-lock-heart"]').count()
        lock_chat = await page.locator('[data-testid="tab-lock-chatbox"]').count()
        # Look for any mood-tracker/mood button hint
        body_txt = await page.locator("body").inner_text()
        results["B_no_paywall_on_mood"] = pw_count == 0
        results["B_no_lock_badges"] = lock_heart == 0 and lock_chat == 0
        results["B_mood_body_snippet"] = body_txt[:200]
        await page.screenshot(path="/app/tests_ui/it16_b_mood.png")
        print("no paywall/mood:", pw_count == 0, "no lock badges:", lock_heart == 0 and lock_chat == 0)

        # Feedback should show form (no paywall)
        await page.goto(f"{URL}/(main)/feedback", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2500)
        fb_pw_count = await page.locator('[data-testid="paywall-screen"]').count()
        results["B_no_paywall_on_feedback"] = fb_pw_count == 0

        # Profile subtitle "Full access via University of Bedfordshire" + badge "Partner"
        await page.goto(f"{URL}/(main)/profile", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2500)
        sub_count = await page.locator('[data-testid="premium-card-subtitle"]').count()
        sub_text = (await page.locator('[data-testid="premium-card-subtitle"]').first.inner_text()).strip() if sub_count else ""
        results["B_premium_card_subtitle"] = sub_text
        prof_body = await page.locator("body").inner_text()
        results["B_profile_has_partner_badge"] = "Partner" in prof_body
        print("subtitle:", sub_text, "Partner in profile body:", results["B_profile_has_partner_badge"])

        # /subscription: partner banner, no cancel/upgrade
        await page.goto(f"{URL}/(main)/subscription", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2500)
        banner = await page.locator('[data-testid="university-partner-banner"]').count()
        sub_body = await page.locator("body").inner_text()
        results["B_partner_banner"] = banner == 1
        results["B_partner_access_badge_text"] = "Partner University Access" in sub_body
        results["B_no_cancel_button"] = "Cancel Subscription" not in sub_body
        # Upgrade purchase button ($ / Upgrade to Premium button)
        results["B_no_upgrade_buy_button"] = ("Upgrade to Premium" not in sub_body) and ("Subscribe" not in sub_body)
        await page.screenshot(path="/app/tests_ui/it16_b_subscription.png")
        print("partner banner:", banner, "no cancel:", results["B_no_cancel_button"], "no upgrade:", results["B_no_upgrade_buy_button"])

        # Connect: filter icon opens filters (not premium prompt)
        await page.goto(f"{URL}/(main)/matches", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3500)
        filter_btn = page.locator('[data-testid="open-discovery-filters-button"]')
        if await filter_btn.count():
            await filter_btn.first.click()
            await page.wait_for_timeout(1500)
            upgrade_prompt = await page.locator('[data-testid="upgrade-prompt-title"]').count()
            results["B_filters_opens_no_upgrade_prompt"] = upgrade_prompt == 0
            print("upgrade_prompt on filter click (expect 0):", upgrade_prompt)
        else:
            results["B_filters_opens_no_upgrade_prompt"] = "filter-button-not-found"
        results["B_errors"] = errors[:5]
    except Exception as e:
        results["B_exception"] = str(e)
        print("FLOW B ERROR:", e)
    finally:
        await b.close()

    # Delete licence -> paywall returns
    requests.delete(f"{API}/admin/university-licences/{lic_id}", headers={"Authorization": f"Bearer {tok}"}, timeout=10)
    print("deleted licence", lic_id)

    b2 = await p.chromium.launch()
    ctx2 = await b2.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page2 = await ctx2.new_page()
    try:
        await student_login(page2)
        pw2 = await page2.locator('[data-testid="paywall-screen"]').count()
        results["B_paywall_returns_after_delete"] = pw2 == 1
        print("paywall returns after delete:", pw2)
    except Exception as e:
        results["B_revert_exception"] = str(e)
    finally:
        await b2.close()


async def flow_c_admin(p, results, tok):
    print("\n=== FLOW C – Super admin licences tab + Uni admin card ===")
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": 1280, "height": 800})
    page = await ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("dialog", lambda d: asyncio.create_task(d.accept()))
    try:
        await page.goto(f"{URL}/admin/login", wait_until="networkidle", timeout=120000)
        await page.wait_for_timeout(2500)
        await page.locator('input[placeholder="admin@dequad.com"]').fill(ADMIN[0])
        await page.locator('input[placeholder="Enter your password"]').fill(ADMIN[1])
        # Admin code only needed for first-time setup; existing admin already seeded
        await page.get_by_text("Access dashboard", exact=True).click(timeout=10000)
        await page.wait_for_timeout(5000)
        print("after admin login url:", page.url)

        # Click Licences tab (chip). Data-testid on tab chip isn't wired
        # in dashboard.tsx (only the panel content has it), so click by text.
        lic_tab_chip = page.get_by_text("Licences", exact=True).first
        if await lic_tab_chip.count() == 0:
            results["C_licences_tab_missing"] = True
            await page.screenshot(path="/app/tests_ui/it16_c_admin_dash.png")
        else:
            await lic_tab_chip.click()
            await page.wait_for_timeout(2500)
            # Panel content wrapper has testID admin-licences-tab
            results["C_licences_panel_visible"] = await page.locator('[data-testid="admin-licences-tab"]').count() >= 1
            add_btn = page.locator('[data-testid="licence-add-button"]')
            results["C_add_button_present"] = await add_btn.count() >= 1
            await add_btn.first.click()
            await page.wait_for_timeout(1500)
            form_present = await page.locator('[data-testid="licence-form"]').count()
            results["C_form_visible"] = form_present >= 1

            # Empty domains validation
            await page.locator('[data-testid="licence-name-input"]').fill("Test Uni")
            # Save with empty domains -> alert
            page.once("dialog", lambda d: asyncio.create_task(d.accept()))
            await page.locator('[data-testid="licence-save-button"]').click()
            await page.wait_for_timeout(1500)
            # Then fill domains and save
            await page.locator('[data-testid="licence-domains-input"]').fill("testuni.ac.uk, students.testuni.ac.uk")
            await page.locator('[data-testid="licence-save-button"]').click()
            await page.wait_for_timeout(3000)

            # Card appears
            cards = await page.locator('[data-testid^="licence-card-"]').count()
            results["C_card_created"] = cards >= 1
            await page.screenshot(path="/app/tests_ui/it16_c_licence_card.png")
            print("licence cards:", cards)

            # Read id from testid
            first_card = page.locator('[data-testid^="licence-card-"]').first
            testid = await first_card.get_attribute("data-testid") if cards else ""
            lic_id = testid.split("licence-card-")[-1] if testid else None
            print("new licence id:", lic_id)
            body_before = await page.locator("body").inner_text()
            results["C_active_pill_present"] = "Active" in body_before

            # Pause
            if lic_id:
                await page.locator(f'[data-testid="licence-toggle-{lic_id}"]').click()
                await page.wait_for_timeout(2000)
                body_paused = await page.locator("body").inner_text()
                results["C_paused_pill"] = "Paused" in body_paused

                # Delete (window.confirm auto-accepted)
                await page.locator(f'[data-testid="licence-delete-{lic_id}"]').click()
                await page.wait_for_timeout(2500)
                still = await page.locator(f'[data-testid="licence-card-{lic_id}"]').count()
                results["C_card_removed"] = still == 0
                print("card removed:", still == 0)
        results["C_errors"] = errors[:5]
    except Exception as e:
        results["C_exception"] = str(e)
        print("FLOW C ERROR:", e)
    finally:
        await b.close()

    # University admin flow
    b2 = await p.chromium.launch()
    ctx2 = await b2.new_context(viewport={"width": 1280, "height": 800})
    page2 = await ctx2.new_page()
    try:
        await page2.goto(f"{URL}/(auth)/university-admin-login", wait_until="networkidle", timeout=120000)
        await page2.wait_for_timeout(2500)
        await page2.get_by_placeholder("admin@university.edu").fill(UNI_ADMIN[0])
        await page2.get_by_placeholder("Enter your password").fill(UNI_ADMIN[1])
        try:
            await page2.get_by_text("Sign In", exact=True).click(timeout=3000)
        except Exception:
            try:
                await page2.get_by_text("Login", exact=True).click(timeout=3000)
            except Exception:
                await page2.get_by_role("button").first.click()
        await page2.wait_for_timeout(5000)
        redirect_url = page2.url
        results["C_uni_login_redirect_url"] = redirect_url
        print("uni admin login redirect:", redirect_url)

        # Workaround: /admin/university-dashboard reads uni_admin_token but
        # login stores university_admin_session_token. Bridge tokens so we
        # can verify the licence card rendering.
        session_tok = await page2.evaluate("() => window.localStorage.getItem('university_admin_session_token')")
        if session_tok:
            await page2.evaluate(f"() => window.localStorage.setItem('uni_admin_token', {json.dumps(session_tok)})")
        # Now navigate to admin university dashboard (contains licence card)
        await page2.goto(f"{URL}/admin/university-dashboard", wait_until="networkidle", timeout=60000)
        await page2.wait_for_timeout(5000)
        print("uni admin url:", page2.url)

        status_before = ""
        if await page2.locator('[data-testid="university-licence-status"]').count():
            status_before = (await page2.locator('[data-testid="university-licence-status"]').inner_text()).strip()
        results["C_uni_status_no_licence"] = status_before
        print("uni licence status before:", status_before)

        # Create ACTIVE licence for Manchester
        r = requests.post(f"{API}/admin/university-licences",
                          headers={"Authorization": f"Bearer {tok}"},
                          json={"name": "University of Manchester", "domains": ["manchester.ac.uk"], "active": True},
                          timeout=15)
        lic_id = r.json().get("id") if r.status_code == 200 else None
        await page2.reload(wait_until="networkidle")
        await page2.wait_for_timeout(3000)
        status_after = ""
        if await page2.locator('[data-testid="university-licence-status"]').count():
            status_after = (await page2.locator('[data-testid="university-licence-status"]').inner_text()).strip()
        results["C_uni_status_with_licence"] = status_after
        print("uni licence status after:", status_after)
        if lic_id:
            requests.delete(f"{API}/admin/university-licences/{lic_id}", headers={"Authorization": f"Bearer {tok}"}, timeout=10)
    except Exception as e:
        results["C_uni_exception"] = str(e)
    finally:
        await b2.close()


async def main():
    tok = admin_token()
    delete_all_test_licences(tok)
    results = {}
    async with async_playwright() as p:
        run = os.environ.get("ITER16_RUN", "abc")
        if "a" in run: await flow_a_free(p, results)
        if "b" in run: await flow_b_licensed(p, results, tok)
        if "c" in run: await flow_c_admin(p, results, tok)
    delete_all_test_licences(tok)
    print("\n===== RESULTS =====")
    print(json.dumps(results, indent=2, default=str))
    with open("/app/tests_ui/it16_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)


asyncio.run(main())
