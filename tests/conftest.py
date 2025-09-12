import pytest

from journal import create_app, db


@pytest.fixture(scope="module")
def test_app():
    """Create and configure a new app instance for each test module."""
    # Setup: Create app with testing config
    app = create_app(
        "config.TestingConfig"
    )  # Use the TestingConfig defined in config.py
    app.config.update(
        {
            "TESTING": True,
            # Ensure DB URI uses in-memory for isolation
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "WTF_CSRF_ENABLED": False,  # Disable CSRF for easier form testing in unit/integration tests
            "LOGIN_DISABLED": False,  # Ensure login is not globally disabled by Flask-Login testing utils if used later
            "SERVER_NAME": "localhost.test",  # Required for url_for generation without active request context
        }
    )

    with app.app_context():
        db.create_all()  # Create tables for in-memory db

    yield app  # Testing happens here

    # Teardown: Drop all tables and close connections to avoid ResourceWarning
    with app.app_context():
        db.session.remove()
        db.drop_all()
        try:
            db.engine.dispose()
        except Exception:
            pass


@pytest.fixture(scope="module")
def test_client(test_app):
    """A test client for the app."""
    return test_app.test_client()


# Example fixture for db session (if needed directly in tests)
@pytest.fixture  # Use function scope if tests modify db state
def db_session(test_app):
    """Yields a database session for transaction management in tests."""
    with test_app.app_context():
        yield db.session
        db.session.remove()  # Clean up session after test


# Add fixtures for authenticated client etc. later as needed


@pytest.fixture  # Function scope as it involves login state
def auth_client(test_client, test_app):
    """Provides a test client logged in as a predefined user."""
    username = "crud_user"
    email = "crud@example.com"
    password = "crud_password"

    # Create user within app context
    with test_app.app_context():
        from journal.models import User  # Import here to avoid circular issues

        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
        else:
            # Ensure password is known if user somehow exists from another test module
            user.set_password(password)
            db.session.commit()
        user_id = user.id  # Get user ID after commit

    # Log in the user using the client
    response = test_client.post(
        "/auth/login",
        data={"username": username, "password": password},
        follow_redirects=True,
    )

    assert response.status_code == 200  # Verify login succeeded
    # Return both client and the user's ID
    yield test_client, user_id

    # Teardown: Log out the client (optional, client state resets anyway)
    test_client.get("/auth/logout", follow_redirects=True)


@pytest.fixture
def entry(test_app, auth_client):
    """Create a test journal entry for the authenticated user."""
    _client, user_id = auth_client

    with test_app.app_context():
        from datetime import UTC, datetime

        from journal.models import Entry

        # Create an entry for the authenticated user
        test_entry = Entry(
            title="Test Entry",
            body="This is test content.",  # Changed from content to body
            user_id=user_id,
            timestamp=datetime.now(
                UTC
            ),  # Changed from created_at/updated_at to timestamp
        )
        db.session.add(test_entry)
        db.session.commit()
        entry_id = test_entry.id

    # Get fresh entry to avoid detached instance issues
    with test_app.app_context():
        entry = db.session.get(Entry, entry_id)
        yield entry

        # Cleanup
        if entry:
            db.session.delete(entry)
            db.session.commit()
