from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import uuid

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Retrieve existing request ID from header or generate a new one
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        # Attach request ID to request state so controllers can access it
        request.state.request_id = request_id
        
        # Process request
        response = await call_next(request)
        
        # Inject request ID into response header
        response.headers["X-Request-ID"] = request_id
        return response
