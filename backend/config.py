import os
import stripe

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
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
FREE_SWIPES_PER_DAY = 5

# SMTP Configuration
SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', 'noreply@dequad.com')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'DEQUAD Safeguarding')

# Admin
ADMIN_SECRET_CODE = "DEQUAD_ADMIN_2024"
