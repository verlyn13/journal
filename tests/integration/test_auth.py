from flask import url_for
from journal.models import User
from journal import db  # Import the db instance

# Helper function or fixture could be created for registration/login actions


def test_register_page_loads(test_client, test_app):  # Add test_app
    """Test that the registration page loads correctly."""
    with test_app.app_context():  # Add app context
        response = test_client.get(url_for("auth.register"))
    assert response.status_code == 200
    assert b"Register" in response.data


def test_login_page_loads(test_client, test_app):  # Add test_app
    """Test that the login page loads correctly."""
    with test_app.app_context():  # Add app context
        response = test_client.get(url_for("auth.login"))
    assert response.status_code == 200
    assert b"Log In" in response.data


def test_successful_registration(test_client, test_app):
    """Test a user can register successfully."""
    with test_app.app_context():  # Add app context
        response = test_client.post(
            url_for("auth.register"),
            data={
                "username": "newuser_reg",
                "email": "new_reg@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
            follow_redirects=True,
        )  # Follow redirect to login page

    assert response.status_code == 200  # Should end up on login page
    assert (
        b"Congratulations, you are now a registered user!" in response.data
    )  # Check flash message
    assert b"Log In" in response.data  # Check we are on login page

    # Verify user exists in the database (needs app context)
    with test_app.app_context():
        user = User.query.filter_by(username="newuser_reg").first()
        assert user is not None
        assert user.email == "new_reg@example.com"


def test_registration_duplicate_username(test_client, test_app):
    """Test registration fails with a duplicate username."""
    # First, create a user (needs app context)
    with test_app.app_context():
        u = User(username="duplicate_user", email="unique1@example.com")
        u.set_password("pw")
        # Use the imported db instance's session
        db.session.add(u)
        db.session.commit()

    # Attempt to register with the same username
    with test_app.app_context():  # Add app context
        response = test_client.post(
            url_for("auth.register"),
            data={
                "username": "duplicate_user",
                "email": "unique2@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
            follow_redirects=True,
        )  # Can follow redirects

    # Form validation fails, so it re-renders the registration page (200 OK)
    assert response.status_code == 200
    # Check for the validation error message from the form's validate_username method
    assert b"Username already taken. Please choose a different one." in response.data
    assert b"Register" in response.data  # Still on register page


def test_registration_duplicate_email(test_client, test_app):
    """Test registration fails with a duplicate email."""
    # First, create a user (needs app context)
    with test_app.app_context():
        u = User(username="unique_user1", email="duplicate@example.com")
        u.set_password("pw")
        # Use the imported db instance's session
        db.session.add(u)
        db.session.commit()

    # Attempt to register with the same email
    with test_app.app_context():  # Add app context
        response = test_client.post(
            url_for("auth.register"),
            data={
                "username": "unique_user2",
                "email": "duplicate@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
            follow_redirects=True,
        )  # Can follow redirects now

    # Form validation fails, so it re-renders the registration page (200 OK)
    assert response.status_code == 200
    # Check for the validation error message from the form's validate_email method
    assert (
        b"Email address already registered. Please use a different one or log in."
        in response.data
    )
    assert b"Register" in response.data  # Still on register page


def test_successful_login_logout(test_client, test_app):
    """Test successful login and subsequent logout."""
    username = "login_user"
    password = "login_password"
    # Create user directly in DB for login test (needs app context)
    with test_app.app_context():
        u = User(username=username, email="login@example.com")
        u.set_password(password)
        # Use the imported db instance's session
        db.session.add(u)
        db.session.commit()

    # --- Test Login ---
    with test_app.app_context():  # Add app context
        response_login = test_client.post(
            url_for("auth.login"),
            data={"username": username, "password": password},
            follow_redirects=True,
        )

    assert response_login.status_code == 200
    # Check for content expected after login (e.g., welcome message on index)
    assert f"Welcome, {username}!".encode("utf-8") in response_login.data
    # Check session state
    with test_client.session_transaction() as sess:
        assert sess["_user_id"] is not None
        # assert sess['csrf_token'] is not None # CSRF is disabled in testing config

    # --- Test Logout ---
    with test_app.app_context():  # Add app context
        response_logout = test_client.get(url_for("auth.logout"), follow_redirects=True)
    assert response_logout.status_code == 200
    assert b"You have been logged out." in response_logout.data
    assert b"Log In" in response_logout.data  # Should be back on login page

    # Verify session is cleared
    with test_client.session_transaction() as sess:
        assert "_user_id" not in sess

    # Verify accessing protected page redirects to login
    with test_app.app_context():  # Add app context
        # login_url = url_for('auth.login') # Generate URL inside context (moved below)
        response_protected = test_client.get(
            url_for("main.index"), follow_redirects=False
        )  # Don't follow redirect
    assert response_protected.status_code == 302  # Redirect status
    # Need app context to generate comparison URL
    with test_app.app_context():
        login_url = url_for("auth.login")
    assert (
        login_url.split("://", 1)[1].split("/", 1)[1] in response_protected.location
    )  # Check path part of URL


def test_login_invalid_credentials(test_client, test_app):  # Add test_app
    """Test login fails with invalid credentials."""
    with test_app.app_context():  # Add app context
        response = test_client.post(
            url_for("auth.login"),
            data={"username": "nonexistentuser", "password": "wrongpassword"},
            follow_redirects=True,
        )

    assert response.status_code == 200  # Stays on login page
    assert b"Invalid username or password" in response.data  # Check flash message
    # Verify session is not set
    with test_client.session_transaction() as sess:
        assert "_user_id" not in sess
