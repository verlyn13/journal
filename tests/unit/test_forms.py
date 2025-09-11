from journal.auth.forms import LoginForm, RegistrationForm
from journal.main.forms import EntryForm

# --- RegistrationForm Tests ---


def test_registration_form_valid(test_app):  # Add test_app fixture
    """Test RegistrationForm validation succeeds with valid data."""
    with test_app.app_context():  # Push context
        form = RegistrationForm(
            username="newuser",
            email="new@example.com",
            password="password123",
            confirm_password="password123",
        )
        # Basic validation check within context
        assert form.validate()
        assert form.username.data == "newuser"
        assert form.email.data == "new@example.com"


def test_registration_form_missing_fields(test_app):  # Add test_app fixture
    """Test RegistrationForm validation fails with missing fields."""
    with test_app.app_context():  # Push context
        form = RegistrationForm()  # No data provided
        assert not form.validate()  # Expect validation to fail
        assert "username" in form.errors
        assert "email" in form.errors
        assert "password" in form.errors
        assert "confirm_password" in form.errors


def test_registration_form_invalid_email(test_app):  # Add test_app fixture
    """Test RegistrationForm validation fails with invalid email."""
    with test_app.app_context():  # Push context
        form = RegistrationForm(
            username="user", email="not-an-email", password="pw", confirm_password="pw"
        )
        assert not form.validate()
        assert "email" in form.errors
        assert "Invalid email address." in form.errors["email"]


def test_registration_form_password_mismatch(test_app):  # Add test_app fixture
    """Test RegistrationForm validation fails with mismatched passwords."""
    with test_app.app_context():  # Push context
        form = RegistrationForm(
            username="user", email="e@e.com", password="pw1", confirm_password="pw2"
        )
        assert not form.validate()
        assert "confirm_password" in form.errors
        assert "Passwords must match." in form.errors["confirm_password"]


# --- LoginForm Tests ---


def test_login_form_valid(test_app):  # Add test_app fixture
    """Test LoginForm validation succeeds with valid data."""
    with test_app.app_context():  # Push context
        form = LoginForm(username="testuser", password="password")
        assert form.username.data == "testuser"
        # Basic validation check
        assert form.validate()  # Should pass basic DataRequired checks


def test_login_form_missing_fields(test_app):  # Add test_app fixture
    """Test LoginForm validation fails with missing fields."""
    with test_app.app_context():  # Push context
        form = LoginForm()
        assert not form.validate()
        assert "username" in form.errors
        assert "password" in form.errors


# --- EntryForm Tests ---


def test_entry_form_valid(test_app):  # Add test_app fixture
    """Test EntryForm validation succeeds with valid data."""
    with test_app.app_context():  # Push context
        form = EntryForm(title="My Title", body="My Body")
        assert form.title.data == "My Title"
        assert form.body.data == "My Body"
        assert form.validate()  # Should pass DataRequired checks


def test_entry_form_missing_fields(test_app):  # Add test_app fixture
    """Test EntryForm validation fails with missing fields."""
    with test_app.app_context():  # Push context
        form = EntryForm()
        assert not form.validate()
        assert "title" in form.errors
        assert "body" in form.errors


# Add tests for length constraints if they were added to forms
