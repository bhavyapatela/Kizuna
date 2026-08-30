from fastapi import Request, HTTPException, status
import time
from collections import defaultdict
from typing import Dict, List

# In-memory store for rate limiting: ip -> list of request timestamps
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)

def rate_limiter(limit: int = 5, window_seconds: int = 60):
    """
    FastAPI dependency factory for basic in-memory rate limiting.
    """
    def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Get request history for this IP
        history = _rate_limit_store[client_ip]
        
        # Filter out timestamps older than the window
        history = [t for t in history if now - t < window_seconds]
        _rate_limit_store[client_ip] = history
        
        if len(history) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
        
        # Record current request timestamp
        history.append(now)
        
    return dependency
