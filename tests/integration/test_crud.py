import pytest
from flask import url_for
from journal.models import Entry, User, Tag
from journal import db # Import the db instance

# Helper to create an entry directly for testing updates/deletes
def create_test_entry(test_app, user_id, title="Initial Title", body="Initial Body"):
    with test_app.app_context():
        # Fetch user within this context using user_id
        user = db.session.get(User, user_id)
        if not user:
             pytest.fail(f"User with id {user_id} not found in create_test_entry context.")

        entry = Entry(title=title, body=body, author=user)
        db.session.add(entry)
        db.session.commit()
        # Query again to get the ID assigned after commit
        committed_entry = Entry.query.filter_by(user_id=user_id, title=title).order_by(Entry.id.desc()).first()
        if not committed_entry:
             pytest.fail(f"Could not find committed entry with title {title} for user {user_id}.")
        return committed_entry.id # Return ID for later use

def test_index_loads_authenticated(auth_client, test_app): # Add test_app
    """Test the index page loads for an authenticated user."""
    client, user_id = auth_client # Get user_id
    with test_app.app_context(): # Add app context
        response = client.get(url_for('main.index'))
    assert response.status_code == 200
    # Need context to fetch user for assertion
    with test_app.app_context():
        user = db.session.get(User, user_id)
        assert user is not None
        assert f"Welcome, {user.username}!".encode('utf-8') in response.data

def test_new_entry_page_loads(auth_client, test_app): # Add test_app
    """Test the new entry page loads for an authenticated user."""
    client, _ = auth_client
    with test_app.app_context(): # Add app context
        response = client.get(url_for('main.new_entry'))
    assert response.status_code == 200
    assert b"Create New Journal Entry" in response.data

def test_create_new_entry(auth_client, test_app):
    """Test creating a new entry successfully."""
    client, user_id = auth_client # Get user_id
    entry_title = "My First Test Entry"
    entry_body = "This is the content of the test entry."

    with test_app.app_context(): # Add app context
        response = client.post(url_for('main.new_entry'), data={
            'title': entry_title,
            'body': entry_body,
            'tags': ' test , python, Flask ' # Add tags with varied spacing/case
        }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Your entry has been saved." in response.data
    # Check if the entry title and tags appear on the index page
    assert entry_title.encode('utf-8') in response.data
    # Check for normalized tags
    assert b'test' in response.data
    assert b'python' in response.data
    assert b'flask' in response.data

    # Verify entry exists in DB (needs app context)
    with test_app.app_context():
        user = db.session.get(User, user_id) # Fetch user
        entry = Entry.query.filter_by(title=entry_title, user_id=user_id).first()
        assert entry is not None
        assert entry.body == entry_body
        assert entry.author == user # Compare fetched user
        # Verify tags were created and associated correctly (normalized)
        tag_names = sorted([tag.name for tag in entry.tags])
        assert tag_names == ['flask', 'python', 'test']

def test_view_entry_detail(auth_client, test_app):
    """Test viewing the detail page of an owned entry."""
    client, user_id = auth_client
    # Create entry with tags for detail view test
    with test_app.app_context():
        user = db.session.get(User, user_id)
        entry = Entry(title="Detail Test", body="Detail Body", author=user)
        db.session.add(entry) # Add entry before querying tags
        tag1 = Tag.query.filter_by(name='detail').first() or Tag(name='detail')
        tag2 = Tag.query.filter_by(name='view').first() or Tag(name='view')
        entry.tags.extend([tag1, tag2])
        db.session.commit()
        entry_id = entry.id

    with test_app.app_context(): # Add app context
        response = client.get(url_for('main.entry_detail', entry_id=entry_id))
    assert response.status_code == 200
    assert b"Detail Test" in response.data
    assert b"Detail Body" in response.data
    # Check tags are displayed
    assert b'detail' in response.data
    assert b'view' in response.data

def test_edit_entry_page_loads(auth_client, test_app):
    """Test the edit entry page loads with correct data."""
    client, user_id = auth_client
    # Create entry with tags for edit view test
    with test_app.app_context():
        user = db.session.get(User, user_id)
        entry = Entry(title="Edit Me", body="Original Body", author=user)
        db.session.add(entry) # Add entry before querying tags
        tag1 = Tag.query.filter_by(name='edit').first() or Tag(name='edit')
        tag2 = Tag.query.filter_by(name='original').first() or Tag(name='original')
        entry.tags.extend([tag1, tag2])
        db.session.commit()
        entry_id = entry.id

    with test_app.app_context(): # Add app context
        response = client.get(url_for('main.edit_entry', entry_id=entry_id))
    assert response.status_code == 200
    assert b"Edit Journal Entry" in response.data
    assert b'value="Edit Me"' in response.data
    assert b"Original Body" in response.data
    # Check tags field is pre-populated (order might vary, check for presence)
    assert b'value="edit, original"' in response.data or b'value="original, edit"' in response.data

def test_update_entry(auth_client, test_app):
    """Test updating an existing entry."""
    client, user_id = auth_client
    # Create entry with tags for update test
    with test_app.app_context():
        user = db.session.get(User, user_id)
        entry = Entry(title="Before Update", body="Old Body", author=user)
        db.session.add(entry) # Add entry before querying tags
        tag1 = Tag.query.filter_by(name='update').first() or Tag(name='update')
        tag2 = Tag.query.filter_by(name='keep').first() or Tag(name='keep')
        entry.tags.extend([tag1, tag2])
        db.session.commit()
        entry_id = entry.id

    updated_title = "After Update"
    updated_body = "New Body Content"
    updated_tags = " keep, new_tag , UPDATE " # Remove 'update', keep 'keep', add 'new_tag'

    with test_app.app_context(): # Add app context
        response = client.post(url_for('main.edit_entry', entry_id=entry_id), data={
            'title': updated_title,
            'body': updated_body,
            'tags': updated_tags
        }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Your entry has been updated." in response.data
    # Check content on the detail page it redirects to
    assert updated_title.encode('utf-8') in response.data
    assert updated_body.encode('utf-8') in response.data
    # Check updated tags are displayed (normalized)
    assert b'keep' in response.data
    assert b'new_tag' in response.data
    assert b'update' in response.data # Case normalized
    # The tag 'update' (normalized from 'UPDATE') *should* be present, so the 'not in' assertion was incorrect.
    # The previous assertions already confirm 'keep', 'new_tag', and 'update' are present.

    # Verify update in DB (needs app context)
    with test_app.app_context():
        entry = db.session.get(Entry, entry_id) # Use session.get for primary key lookup
        assert entry is not None
        assert entry.title == updated_title
        assert entry.body == updated_body
        # Verify tags updated in DB (normalized)
        tag_names = sorted([tag.name for tag in entry.tags])
        assert tag_names == ['keep', 'new_tag', 'update']

def test_delete_entry(auth_client, test_app):
    """Test deleting an owned entry."""
    client, user_id = auth_client # Get user_id
    entry_id = create_test_entry(test_app, user_id, title="To Be Deleted", body="Delete Me") # Pass user_id

    # Verify it exists first (needs app context)
    with test_app.app_context():
        entry = db.session.get(Entry, entry_id) # Use session.get
        assert entry is not None

    with test_app.app_context(): # Add app context
        response = client.post(url_for('main.delete_entry', entry_id=entry_id), follow_redirects=True)

    assert response.status_code == 200
    assert b"Your entry has been deleted." in response.data
    assert b"To Be Deleted" not in response.data # Should not be on index page

    # Verify deleted from DB (needs app context)
    with test_app.app_context():
        entry = db.session.get(Entry, entry_id) # Use session.get
        assert entry is None

def test_access_non_owned_entry_forbidden(auth_client, test_app):
    """Test accessing/editing/deleting a non-owned entry results in 403."""
    client, user1_id = auth_client # This is user1's ID
    other_entry_id = None
    user2_id = None

    # Create another user and an entry owned by them (needs app context)
    with test_app.app_context():
        user2 = User.query.filter_by(username='otheruser').first()
        if not user2:
            user2 = User(username='otheruser', email='other@e.com')
            user2.set_password('pw')
            # Use the imported db instance's session
            db.session.add(user2)
            db.session.commit()
        user2_id = user2.id # Get ID after commit
        assert user2_id is not None
        other_entry_id = create_test_entry(test_app, user2_id, title="Other User Entry") # Pass user2_id

    assert other_entry_id is not None # Ensure entry was created

    # User1 tries to access User2's entry
    with test_app.app_context(): # Add app context
        response_view = client.get(url_for('main.entry_detail', entry_id=other_entry_id))
    assert response_view.status_code == 403

    with test_app.app_context(): # Add app context
        response_edit_get = client.get(url_for('main.edit_entry', entry_id=other_entry_id))
    assert response_edit_get.status_code == 403

    with test_app.app_context(): # Add app context
        response_edit_post = client.post(url_for('main.edit_entry', entry_id=other_entry_id), data={'title':'hack', 'body':'hack'})
    assert response_edit_post.status_code == 403

    with test_app.app_context(): # Add app context
        response_delete = client.post(url_for('main.delete_entry', entry_id=other_entry_id))
    assert response_delete.status_code == 403

def test_access_nonexistent_entry_404(auth_client, test_app): # Add test_app
    """Test accessing a non-existent entry results in 404."""
    client, _ = auth_client
    non_existent_id = 99999

    with test_app.app_context(): # Add app context
        response_view = client.get(url_for('main.entry_detail', entry_id=non_existent_id))
    assert response_view.status_code == 404

    with test_app.app_context(): # Add app context
        response_edit = client.get(url_for('main.edit_entry', entry_id=non_existent_id))
    assert response_edit.status_code == 404

    with test_app.app_context(): # Add app context
        response_delete = client.post(url_for('main.delete_entry', entry_id=non_existent_id))
    assert response_delete.status_code == 404

def test_filter_by_tag(auth_client, test_app):
    """Test filtering entries by tag."""
    client, user_id = auth_client
    user2_id = None

    # Create another user
    with test_app.app_context():
        user2 = User.query.filter_by(username='tag_otheruser').first()
        if not user2:
            user2 = User(username='tag_otheruser', email='tag_other@e.com')
            user2.set_password('pw')
            db.session.add(user2)
            db.session.commit()
        user2_id = user2.id

    # Create entries with tags for user1
    with test_app.app_context():
        user1 = db.session.get(User, user_id)
        tag_common = Tag.query.filter_by(name='common').first() or Tag(name='common')
        tag_unique1 = Tag.query.filter_by(name='unique1').first() or Tag(name='unique1')
        tag_unique2 = Tag.query.filter_by(name='unique2').first() or Tag(name='unique2')

        e1 = Entry(title="Entry Common 1", body="Body", author=user1)
        e1.tags.append(tag_common)
        e1.tags.append(tag_unique1)

        e2 = Entry(title="Entry Common 2", body="Body", author=user1)
        e2.tags.append(tag_common)

        e3 = Entry(title="Entry Unique 2", body="Body", author=user1)
        e3.tags.append(tag_unique2)

        db.session.add_all([e1, e2, e3, tag_common, tag_unique1, tag_unique2])
        db.session.commit()

    # Create entry with common tag for user2
    with test_app.app_context():
        user2_obj = db.session.get(User, user2_id)
        # Fetch the 'common' tag within this session context by name
        tag_common_u2 = Tag.query.filter_by(name='common').first()
        if not tag_common_u2:
             pytest.fail("Tag 'common' not found in the second context of test_filter_by_tag.")
        e_other = Entry(title="Other User Common", body="Body", author=user2_obj)
        e_other.tags.append(tag_common_u2)
        db.session.add(e_other)
        db.session.commit()

    # Test filtering by 'common' tag for user1
    with test_app.app_context():
        response = client.get(url_for('main.entries_by_tag', tag_name='common'))

    assert response.status_code == 200
    assert b"Entries tagged with 'common'" in response.data
    assert b"Entry Common 1" in response.data
    assert b"Entry Common 2" in response.data
    assert b"Entry Unique 2" not in response.data
    assert b"Other User Common" not in response.data # Ensure other user's entry isn't shown

    # Test filtering by 'unique1' tag
    with test_app.app_context():
        response = client.get(url_for('main.entries_by_tag', tag_name='unique1'))
    assert response.status_code == 200
    assert b"Entries tagged with 'unique1'" in response.data
    assert b"Entry Common 1" in response.data
    assert b"Entry Common 2" not in response.data

    # Test filtering by non-existent tag
    with test_app.app_context():
        response = client.get(url_for('main.entries_by_tag', tag_name='nonexistent'))
    assert response.status_code == 404

    # Test filtering by tag with no entries for this user (but exists)
    with test_app.app_context():
        tag_only_other = Tag(name='only_other')
        user2_obj = db.session.get(User, user2_id)
        e_only_other = Entry(title="Only Other", body="Body", author=user2_obj)
        e_only_other.tags.append(tag_only_other)
        db.session.add_all([tag_only_other, e_only_other])
        db.session.commit()

    with test_app.app_context():
        response = client.get(url_for('main.entries_by_tag', tag_name='only_other'))
    assert response.status_code == 200
    assert b"Entries tagged with 'only_other'" in response.data
    assert b"You haven't written any entries yet." in response.data # Or similar empty message