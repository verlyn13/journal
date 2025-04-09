from journal.models import User, Entry, Tag
from datetime import datetime, timezone, timedelta


def test_user_password_hashing():
    """Test User model password hashing and checking."""
    u = User(username="testuser", email="test@example.com")
    u.set_password("correctpassword")
    assert u.password_hash is not None
    assert u.password_hash != "correctpassword"
    assert u.check_password("correctpassword") is True
    assert u.check_password("wrongpassword") is False


def test_user_repr():
    """Test User model string representation."""
    u = User(username="testuser_repr", email="repr@example.com")
    assert repr(u) == "<User testuser_repr>"


def test_entry_creation(
    db_session,
):  # Use db_session fixture if needed for relationships later
    """Test basic Entry model creation."""
    # Create a dummy user first (required by ForeignKey constraint)
    # Note: This requires the db_session fixture to add/commit
    u = User(username="entry_author", email="author@example.com")
    u.set_password("password")
    db_session.add(u)
    db_session.commit()  # Commit user so Entry can reference it

    # Use naive UTC now
    # entry_time_before = datetime.now(timezone.utc)  # Unused, removed to fix F841
    e = Entry(title="Test Entry", body="This is the body.", author=u)
    db_session.add(e)  # Add immediately after creation
    # entry_time_after = datetime.now(timezone.utc)  # Unused, removed to fix F841

    assert e.title == "Test Entry"
    assert e.body == "This is the body."
    assert e.author == u
    assert e.user_id == u.id
    # db_session.flush() # Let's try committing instead
    db_session.commit()  # Commit to ensure default value is set and persisted
    assert e.timestamp is not None
    # Check timestamp is recent using a delta, avoiding microsecond precision issues
    # between test time capture and DB default execution, especially with SQLite.
    now_utc = datetime.now(timezone.utc).replace(
        tzinfo=None
    )  # Use naive UTC for comparison with DB
    assert abs(now_utc - e.timestamp) < timedelta(seconds=5)


def test_entry_repr(db_session):
    """Test Entry model string representation."""
    u = User(username="entry_author_repr", email="author_repr@example.com")
    u.set_password("password")
    db_session.add(u)
    db_session.commit()
    e = Entry(title="Repr Entry", body="Body.", author=u)
    assert repr(e) == "<Entry Repr Entry>"


def test_tag_creation(db_session):
    """Test basic Tag model creation."""
    # Use naive UTC now
    # tag_time_before = datetime.now(timezone.utc)  # Unused, removed to fix F841
    t = Tag(name="testing")
    # tag_time_after = datetime.now(timezone.utc)  # Unused, removed to fix F841

    assert t.name == "testing"
    db_session.add(t)
    db_session.commit()  # Commit to ensure default value is set
    assert t.id is not None
    assert t.created_at is not None
    # Basic check if timestamp is recent
    # Check timestamp is recent using a delta, avoiding microsecond precision issues
    # between test time capture and DB default execution, especially with SQLite.
    now_utc = datetime.now(timezone.utc).replace(
        tzinfo=None
    )  # Use naive UTC for comparison with DB
    assert abs(now_utc - t.created_at) < timedelta(seconds=5)


def test_tag_repr():
    """Test Tag model string representation."""
    t = Tag(name="repr_tag")
    assert repr(t) == "<Tag repr_tag>"


def test_entry_tag_relationship(db_session):
    """Test the many-to-many relationship between Entry and Tag."""
    # 1. Create User, Entry, and Tags
    u = User(username="tag_user", email="tag_user@example.com")
    u.set_password("password")
    db_session.add(u)
    db_session.commit()

    e1 = Entry(title="Entry with Tags", body="Body 1", author=u)
    db_session.add(e1)  # Add entry before querying tags
    # Fetch or create tags to avoid IntegrityError in repeated test runs
    t1 = db_session.query(Tag).filter_by(name="python").first()
    if not t1:
        t1 = Tag(name="python")
        db_session.add(t1)

    t2 = db_session.query(Tag).filter_by(name="flask").first()
    if not t2:
        t2 = Tag(name="flask")
        db_session.add(t2)

    t3 = db_session.query(Tag).filter_by(name="testing").first()
    if not t3:
        t3 = Tag(name="testing")
        db_session.add(t3)
    # Commit any newly created tags *before* associating them
    db_session.commit()

    # 2. Associate tags with the entry
    e1.tags.append(t1)
    e1.tags.append(t2)

    # Add the entry and commit (relationships should cascade)
    db_session.add(e1)
    db_session.commit()

    # 3. Verify relationships from Entry side
    entry_from_db = db_session.get(Entry, e1.id)
    assert entry_from_db is not None
    assert len(entry_from_db.tags) == 2
    tag_names = sorted([tag.name for tag in entry_from_db.tags])
    assert tag_names == ["flask", "python"]

    # 4. Verify relationships from Tag side
    tag_python = db_session.get(Tag, t1.id)
    tag_flask = db_session.get(Tag, t2.id)
    tag_testing = db_session.get(Tag, t3.id)

    assert tag_python is not None
    assert len(tag_python.entries) == 1
    assert tag_python.entries[0].title == "Entry with Tags"

    assert tag_flask is not None
    assert len(tag_flask.entries) == 1
    assert tag_flask.entries[0].id == e1.id

    assert tag_testing is not None
    assert len(tag_testing.entries) == 0

    # 5. Test adding another entry with an existing tag
    e2 = Entry(title="Another Entry", body="Body 2", author=u)
    e2.tags.append(tag_python)  # Reuse 'python' tag
    db_session.add(e2)
    db_session.commit()

    tag_python_updated = db_session.get(Tag, t1.id)
    assert len(tag_python_updated.entries) == 2
    entry_titles = sorted([entry.title for entry in tag_python_updated.entries])
    assert entry_titles == ["Another Entry", "Entry with Tags"]


# Add more tests, e.g., for relationship loading if needed
