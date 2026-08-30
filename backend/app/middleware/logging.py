from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
import logging

logger = logging.getLogger("app")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Access request ID from state (initialized by RequestIdMiddleware)
        request_id = getattr(request.state, "request_id", "unknown")
        
        logger.info(
            f"[{request_id}] Incoming {request.method} {request.url.path}"
        )
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        logger.info(
            f"[{request_id}] Outgoing status={response.status_code} duration={duration:.4f}s"
        )
        
        return response
