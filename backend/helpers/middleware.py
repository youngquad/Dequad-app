import time
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("middleware")

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
    - General endpoints: 100 requests / 60s per IP
    - Auth endpoints:     10 requests / 60s per IP
    - Webhook endpoints:  exempt (server-to-server)
    """

    GENERAL_LIMIT = 100
    AUTH_LIMIT = 10
    WINDOW_SECONDS = 60

    AUTH_PREFIXES = ("/api/auth/admin-login", "/api/auth/forgot-password",
                     "/api/auth/reset-password", "/api/university-admin/login")
    EXEMPT_PREFIXES = ("/api/subscription/webhook", "/api/stripe/university-webhook")

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
        bucket = f"auth:{client_ip}" if is_auth else f"gen:{client_ip}"
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
