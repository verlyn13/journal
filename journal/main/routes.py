from flask import render_template, flash, redirect, url_for, request, abort, current_app
from flask_login import current_user, login_required
from journal import db
from journal.models import Entry, User, Tag # Ensure User is imported if needed, though current_user handles most cases
from . import main
from .forms import EntryForm


def process_tags(tag_string):
    """
    Processes a comma-separated string of tags into Tag objects.
    
    This helper function parses a comma-separated tag string, normalizes the tag names,
    removes duplicates, and then either retrieves existing Tag objects from the database
    or creates new ones for tags that don't exist yet.
    
    Args:
        tag_string (str): A comma-separated string of tag names (e.g., "python, flask, web")
    
    Returns:
        list: A list of Tag objects (both existing and newly created)
    
    Notes:
        - Tag names are normalized to lowercase and stripped of whitespace
        - Duplicate tag names are removed
        - New tags are added to the db.session but not committed (the caller must commit)
        - Empty string or None returns an empty list
    """
    if not tag_string:
        return []

    # Normalize, remove duplicates and empty strings
    raw_names = [name.strip().lower() for name in tag_string.split(',') if name.strip()]
    unique_names = sorted(list(set(raw_names)))

    tags = []
    existing_tags = Tag.query.filter(Tag.name.in_(unique_names)).all()
    existing_names = {tag.name for tag in existing_tags}
    tags.extend(existing_tags)

    for name in unique_names:
        if name not in existing_names:
            new_tag = Tag(name=name)
            db.session.add(new_tag)
            tags.append(new_tag)
            # Rely on the main commit after route processing

    return tags


@main.route('/')
@main.route('/index')
@login_required # Protect the index page
def index():
    """
    Displays the paginated list of journal entries for the logged-in user.
    
    This is the main landing page after authentication. It shows all journal entries
    belonging to the current user, sorted by timestamp in descending order (newest first)
    with pagination support.
    
    URL Patterns:
        - GET /
        - GET /index
        - GET /?page=<page_number>
    
    Parameters:
        - page: (optional) The page number for pagination (default: 1)
    
    Response:
        - Renders index.html template with:
          - entries: List of Entry objects for the current page
          - pagination: Pagination object for navigation
          - title: Page title
    
    Security:
        - Requires authentication via login_required decorator
    """
    page = request.args.get('page', 1, type=int)
    entries_pagination = Entry.query.filter_by(author=current_user)\
                              .order_by(Entry.timestamp.desc())\
                              .paginate(page=page, per_page=current_app.config['ENTRIES_PER_PAGE'], error_out=False)
    entries = entries_pagination.items
    return render_template('index.html', title='Home', entries=entries, pagination=entries_pagination) # Pass pagination object

@main.route('/new_entry', methods=['GET', 'POST'])
@login_required
def new_entry():
    """
    Handles creation of a new journal entry.
    
    This route displays the entry creation form on GET requests and processes
    form submissions on POST requests. It associates the new entry with the
    current authenticated user and handles tag processing.
    
    Request:
        - GET: Displays the entry creation form
        - POST: Processes the submitted form data
          - title: The title of the journal entry
          - body: The main content of the journal entry
          - tags: Optional comma-separated list of tags
    
    Response:
        - GET: Renders create_entry.html template with the entry form
        - POST (success): Redirects to index page with success message
        - POST (failure): Returns to form with validation errors
    
    Security:
        - Requires authentication via login_required decorator
    """
    form = EntryForm()
    if form.validate_on_submit():
        entry = Entry(title=form.title.data, body=form.body.data, author=current_user)
        db.session.add(entry) # Add entry to session BEFORE processing tags
        # Process tags
        tags = process_tags(form.tags.data)
        entry.tags = tags # Assign the list of Tag objects
        db.session.commit() # This commit saves the entry and the tag relationships
        flash('Your entry has been saved.', 'success')
        return redirect(url_for('main.index'))
    return render_template('main/create_entry.html', title='New Entry', form=form) # Changed template path

@main.route('/entry/<int:entry_id>')
@login_required
def entry_detail(entry_id):
    """
    Displays a detailed view of a single journal entry.
    
    This route retrieves a specific entry by ID and displays its details,
    including title, content, timestamp, and associated tags. It ensures
    that users can only view their own entries.
    
    URL Pattern:
        - GET /entry/<entry_id>
    
    Parameters:
        - entry_id (int): The unique identifier of the entry
    
    Response:
        - Success: Renders entry_detail.html template with the entry object
        - Not Found: 404 error if the entry doesn't exist
        - Forbidden: 403 error if the entry belongs to another user
    
    Security:
        - Requires authentication via login_required decorator
        - Enforces ownership check to prevent unauthorized access
    """
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403) # Forbidden access if not the owner
    return render_template('main/entry_detail.html', title=entry.title, entry=entry) # Changed template path

@main.route('/edit_entry/<int:entry_id>', methods=['GET', 'POST'])
@login_required
def edit_entry(entry_id):
    """
    Handles editing of an existing journal entry.
    
    This route manages both the display of the edit form (GET) and processing of
    form submissions (POST). It retrieves an existing entry, verifies ownership,
    and updates its content with the submitted data.
    
    URL Pattern:
        - GET/POST /edit_entry/<entry_id>
    
    Parameters:
        - entry_id (int): The unique identifier of the entry to edit
    
    Request:
        - GET: Displays pre-populated form with existing entry data
        - POST: Processes the submitted form data with updated values
          - title: The updated title of the journal entry
          - body: The updated content of the journal entry
          - tags: Optional comma-separated list of tags
    
    Response:
        - GET: Renders edit_entry.html template with pre-populated form
        - POST (success): Redirects to entry detail page with success message
        - POST (failure): Returns to form with validation errors
        - Not Found: 404 error if the entry doesn't exist
        - Forbidden: 403 error if the entry belongs to another user
    
    Security:
        - Requires authentication via login_required decorator
        - Enforces ownership check to prevent unauthorized access
    """
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403)
    form = EntryForm()
    if form.validate_on_submit():
        entry.title = form.title.data
        entry.body = form.body.data
        # Process and update tags
        tags = process_tags(form.tags.data)
        entry.tags.clear() # Remove old tags
        entry.tags = tags   # Add new tags
        db.session.commit() # Commit all changes
        flash('Your entry has been updated.', 'success')
        return redirect(url_for('main.entry_detail', entry_id=entry.id))
    elif request.method == 'GET':
        form.title.data = entry.title
        form.body.data = entry.body
        # Pre-populate tags field
        form.tags.data = ', '.join(tag.name for tag in entry.tags)
    return render_template('main/edit_entry.html', title='Edit Entry', form=form, entry=entry) # Changed template path

@main.route('/delete_entry/<int:entry_id>', methods=['POST']) # Use POST for deletion
@login_required
def delete_entry(entry_id):
    """
    Handles deletion of a journal entry.
    
    This route processes POST requests to delete a specific entry. It enforces that
    the deletion operation must be performed via POST (not GET) for security reasons,
    and verifies that the user owns the entry before allowing deletion.
    
    URL Pattern:
        - POST /delete_entry/<entry_id>
    
    Parameters:
        - entry_id (int): The unique identifier of the entry to delete
    
    Response:
        - Success: Redirects to the index page with a success message after deletion
        - Not Found: 404 error if the entry doesn't exist
        - Forbidden: 403 error if the entry belongs to another user
    
    Security:
        - Requires authentication via login_required decorator
        - Enforces ownership check to prevent unauthorized deletion
        - Only accepts POST requests to prevent accidental deletion via GET
    """
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403)
    db.session.delete(entry)
    db.session.commit()
    flash('Your entry has been deleted.', 'success')
    return redirect(url_for('main.index'))


@main.route('/tag/<string:tag_name>')
@login_required
def entries_by_tag(tag_name):
    """
    Displays all journal entries associated with a specific tag.
    
    This route filters entries by tag name and displays only those that belong to
    the currently authenticated user. The resulting entries are paginated and sorted
    by timestamp in descending order (newest first).
    
    URL Pattern:
        - GET /tag/<tag_name>
        - GET /tag/<tag_name>?page=<page_number>
    
    Parameters:
        - tag_name (str): The name of the tag to filter by
        - page (query param, optional): The page number for pagination (default: 1)
    
    Response:
        - Success: Renders index.html template with filtered entries
        - Not Found: 404 error if the specified tag doesn't exist
    
    Security:
        - Requires authentication via login_required decorator
        - Automatically filters entries to show only those belonging to the current user
    """
    tag = Tag.query.filter_by(name=tag_name).first_or_404()
    page = request.args.get('page', 1, type=int)

    # Query entries associated with the tag and the current user
    entries_query = Entry.query.join(Entry.tags)\
        .filter(Tag.id == tag.id)\
        .filter(Entry.user_id == current_user.id)\
        .order_by(Entry.timestamp.desc())

    entries_pagination = entries_query.paginate(
        page=page, per_page=current_app.config['ENTRIES_PER_PAGE'], error_out=False
    )
    entries = entries_pagination.items

    return render_template('index.html',
                           title=f"Entries tagged '{tag_name}'",
                           entries=entries,
                           pagination=entries_pagination,
                           tag_name=tag_name) # Pass tag_name for conditional header
