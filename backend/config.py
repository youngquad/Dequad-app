import os
from pathlib import Path
from dotenv import load_dotenv
import stripe

# Ensure .env is loaded regardless of which module imports config first.
# Idempotent: if database.py already loaded it, load_dotenv is a no-op.
load_dotenv(Path(__file__).parent / ".env")

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
# Separate signing secret for the university subscription webhook. Falls back to
# the main webhook secret if not set, so single-endpoint setups still work.
STRIPE_UNIVERSITY_WEBHOOK_SECRET = os.environ.get(
    'STRIPE_UNIVERSITY_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET
)
stripe.api_key = STRIPE_SECRET_KEY

# Stripe Price Configuration
STRIPE_PRICE_AMOUNT = 499  # in pence
STRIPE_PRICE_CURRENCY = "gbp"
STRIPE_PRODUCT_NAME = "DEQUAD Premium"

# University subscription pricing
UNIVERSITY_PRICE_AMOUNT = 4999  # in pence
UNIVERSITY_PRICE_CURRENCY = "gbp"
UNIVERSITY_PRODUCT_NAME = "DEQUAD University Dashboard"

# Swipe limits
FREE_SWIPES_PER_DAY = 5      # Legacy — no longer enforced (kept for back-compat with imports)
FREE_LIKES_PER_WEEK = 3      # Free plan: 3 likes per ISO week, unlimited skips

# SMTP Configuration
SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', 'noreply@dequad.com')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'DEQUAD Safeguarding')

# Admin
ADMIN_SECRET_CODE = os.environ.get('ADMIN_SECRET_CODE', '')
