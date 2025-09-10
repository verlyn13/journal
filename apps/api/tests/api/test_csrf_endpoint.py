from __future__ import annotations

import pytest


@pytest.mark.asyncio()
async def test_get_csrf_sets_cookie_and_returns_token(client):
    # Call the CSRF endpoint
    r = await client.get("/api/v1/auth/csrf")
    assert r.status_code == 200
    data = r.json()
    # Body should include csrfToken
    assert isinstance(data.get("csrfToken"), str) and len(data["csrfToken"]) > 0

    # Cookie should be set on response
    cookies = r.cookies
    token_cookie = cookies.get("csrftoken")
    assert token_cookie is not None
    # Values should match
    assert data["csrfToken"] == token_cookie
