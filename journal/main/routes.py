from flask import render_template, flash, redirect, url_for, request, abort, current_app
from flask_login import current_user, login_required
from journal import db
from journal.models import Entry, User # Ensure User is imported if needed, though current_user handles most cases
from . import main
from .forms import EntryForm

@main.route('/')
@main.route('/index')
@login_required # Protect the index page
def index():
    """Displays the paginated list of entries for the logged-in user."""
    page = request.args.get('page', 1, type=int)
    entries_pagination = Entry.query.filter_by(author=current_user)\
                              .order_by(Entry.timestamp.desc())\
                              .paginate(page=page, per_page=current_app.config['ENTRIES_PER_PAGE'], error_out=False)
    entries = entries_pagination.items
    return render_template('index.html', title='Home', entries=entries, pagination=entries_pagination) # Pass pagination object

@main.route('/new_entry', methods=['GET', 'POST'])
@login_required
def new_entry():
    """Handles creation of a new journal entry."""
    form = EntryForm()
    if form.validate_on_submit():
        entry = Entry(title=form.title.data, body=form.body.data, author=current_user)
        db.session.add(entry)
        db.session.commit()
        flash('Your entry has been saved.', 'success')
        return redirect(url_for('main.index'))
    return render_template('main/create_entry.html', title='New Entry', form=form) # Changed template path

@main.route('/entry/<int:entry_id>')
@login_required
def entry_detail(entry_id):
    """Displays a single journal entry."""
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403) # Forbidden access if not the owner
    return render_template('main/entry_detail.html', title=entry.title, entry=entry) # Changed template path

@main.route('/edit_entry/<int:entry_id>', methods=['GET', 'POST'])
@login_required
def edit_entry(entry_id):
    """Handles editing of an existing journal entry."""
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403)
    form = EntryForm()
    if form.validate_on_submit():
        entry.title = form.title.data
        entry.body = form.body.data
        db.session.commit()
        flash('Your entry has been updated.', 'success')
        return redirect(url_for('main.entry_detail', entry_id=entry.id))
    elif request.method == 'GET':
        form.title.data = entry.title
        form.body.data = entry.body
    return render_template('main/edit_entry.html', title='Edit Entry', form=form, entry=entry) # Changed template path

@main.route('/delete_entry/<int:entry_id>', methods=['POST']) # Use POST for deletion
@login_required
def delete_entry(entry_id):
    """Handles deletion of a journal entry."""
    entry = db.get_or_404(Entry, entry_id)
    if entry.author != current_user:
        abort(403)
    db.session.delete(entry)
    db.session.commit()
    flash('Your entry has been deleted.', 'success')
    return redirect(url_for('main.index'))