import os
import time
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("middleware")

# ==================== SECURITY HEADERS ====================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add a conservative set of security-related response headers.

    Applied globally so every API + static response benefits. Intentionally
    modest — this is a JSON API + static docs backend, not an HTML app, so
    no CSP script-src work is needed. Kept in one place to make future
    audits easy (SEC-audit P3, 2026-07).
    """

    HEADERS = {
        # Deter MIME sniffing of API JSON as executable content.
        "X-Content-Type-Options": "nosniff",
        # We don't want the API embedded in any frame anywhere.
        "X-Frame-Options": "DENY",
        # Strip referrers cross-origin so tokens/IDs never leak via Referer.
        "Referrer-Policy": "strict-origin-when-cross-origin",
        # Force HTTPS for a year on the API domain. Safe: the ingress is
        # already TLS-terminated everywhere.
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        # Restrict powerful browser features we never use from this API.
        "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(self)",
    }

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for k, v in self.HEADERS.items():
            response.headers.setdefault(k, v)
        return response


# ==================== REQUEST LOGGING ====================

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
        method = request.method
        path = request.url.path

        response = await call_next(request)

        elapsed_ms = (time.perf_counter() - start) * 1000
        status = response.status_code

        log_msg = f"{client_ip} {method} {path} {status} {elapsed_ms:.0f}ms"
        if status >= 500:
            logger.error(log_msg)
        elif status >= 400:
            logger.warning(log_msg)
        else:
            logger.info(log_msg)

        response.headers["X-Response-Time"] = f"{elapsed_ms:.0f}ms"
        return response


# ==================== RATE LIMITING ====================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding-window rate limiter.
    - General endpoints: 600 requests / 60s per IP
    - Auth endpoints:    120 requests / 60s per IP and endpoint
    - Webhook endpoints:  exempt (server-to-server)

    Account/password lockout is handled separately in login_lockout.py. Keeping
    auth traffic in endpoint-specific buckets prevents registration or OTP
    traffic from locking every login route for a university on shared Wi-Fi.
    """

    # Limits are env-tunable so testing/CI environments (which pound the
    # /auth/* endpoints from a single IP) can widen the window without
    # touching source. Production defaults are strict but not so strict they
    # break Playwright / pytest suites.
    GENERAL_LIMIT = int(os.environ.get("RATE_LIMIT_GENERAL", "600"))
    AUTH_LIMIT = int(os.environ.get("RATE_LIMIT_AUTH", "120"))
    WINDOW_SECONDS = 60

    AUTH_PREFIXES = ("/api/auth/admin-login", "/api/auth/email-login",
                     "/api/auth/register", "/api/auth/verify-email",
                     "/api/auth/resend-verification",
                     "/api/auth/forgot-password", "/api/auth/reset-password",
                     "/api/university-admin/login")
    EXEMPT_PREFIXES = (
        "/api/subscription/webhook",
        "/api/subscription/revenuecat-webhook",
        "/api/stripe/university-webhook",
    )

    def __init__(self, app):
        super().__init__(app)
        self._hits: dict[str, list[float]] = defaultdict(list)

    def _prune(self, key: str, now: float):
        cutoff = now - self.WINDOW_SECONDS
        self._hits[key] = [t for t in self._hits[key] if t > cutoff]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if any(path.startswith(p) for p in self.EXEMPT_PREFIXES):
            return await call_next(request)

        client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
        now = time.time()

        is_auth = any(path.startswith(p) for p in self.AUTH_PREFIXES)
        bucket = f"auth:{client_ip}:{path}" if is_auth else f"gen:{client_ip}"
        limit = self.AUTH_LIMIT if is_auth else self.GENERAL_LIMIT

        self._prune(bucket, now)

        if len(self._hits[bucket]) >= limit:
            retry_after = int(self.WINDOW_SECONDS - (now - self._hits[bucket][0]))
            logger.warning(f"Rate limit hit: {client_ip} on {path} ({len(self._hits[bucket])}/{limit})")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(max(1, retry_after))}
            )

        self._hits[bucket].append(now)

        response = await call_next(request)
        remaining = limit - len(self._hits[bucket])
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response
