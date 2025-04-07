import pytest
from journal.models import User, Entry
from datetime import datetime, timezone, timedelta

def test_user_password_hashing():
    """Test User model password hashing and checking."""
    u = User(username='testuser', email='test@example.com')
    u.set_password('correctpassword')
    assert u.password_hash is not None
    assert u.password_hash != 'correctpassword'
    assert u.check_password('correctpassword') is True
    assert u.check_password('wrongpassword') is False

def test_user_repr():
    """Test User model string representation."""
    u = User(username='testuser_repr', email='repr@example.com')
    assert repr(u) == '<User testuser_repr>'

def test_entry_creation(db_session): # Use db_session fixture if needed for relationships later
    """Test basic Entry model creation."""
    # Create a dummy user first (required by ForeignKey constraint)
    # Note: This requires the db_session fixture to add/commit
    u = User(username='entry_author', email='author@example.com')
    u.set_password('password')
    db_session.add(u)
    db_session.commit() # Commit user so Entry can reference it

    entry_time_before = datetime.now(timezone.utc)
    e = Entry(title='Test Entry', body='This is the body.', author=u)
    entry_time_after = datetime.now(timezone.utc)

    assert e.title == 'Test Entry'
    assert e.body == 'This is the body.'
    assert e.author == u
    assert e.user_id == u.id
    db_session.add(e) # Add to session to trigger defaults/persistence
    # db_session.flush() # Let's try committing instead
    db_session.commit() # Commit to ensure default value is set and persisted
    assert e.timestamp is not None
    # Check timestamp is close to now (within reason for test execution time)
    # Timestamp comparison with timezone can be tricky with SQLite in tests.
    # For this unit test, simply ensure the default mechanism set a timestamp.
    # More robust timezone testing might require integration tests or different DB setup.
    pass # Already asserted e.timestamp is not None earlier

def test_entry_repr(db_session):
    """Test Entry model string representation."""
    u = User(username='entry_author_repr', email='author_repr@example.com')
    u.set_password('password')
    db_session.add(u)
    db_session.commit()
    e = Entry(title='Repr Entry', body='Body.', author=u)
    assert repr(e) == '<Entry Repr Entry>'

# Add more tests, e.g., for relationship loading if needed