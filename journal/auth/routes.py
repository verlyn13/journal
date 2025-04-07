from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from . import auth  # Import the blueprint instance
from .forms import LoginForm, RegistrationForm
from .. import db  # Import the database instance
from ..models.user import User # Import the User model

@auth.route('/register', methods=['GET', 'POST'])
def register():
    """Handle requests to the /register route."""
    # If user is already logged in, redirect to the main page
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    form = RegistrationForm()
    if form.validate_on_submit():
        # Check for existing username
        existing_user = User.query.filter_by(username=form.username.data).first()
        if existing_user:
            flash('Username already taken.', 'warning')
            return redirect(url_for('auth.register'))
        # Check for existing email
        existing_email = User.query.filter_by(email=form.email.data).first()
        if existing_email:
            flash('Email already in use.', 'warning')
            return redirect(url_for('auth.register'))

        # Create new user instance
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        # Add user to the database session and commit
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!', 'success')
        # Redirect to the login page after successful registration
        return redirect(url_for('auth.login'))
    # Render the registration template if GET request or form validation fails
    return render_template('auth/register.html', title='Register', form=form)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    """Handle requests to the /login route."""
    # If user is already logged in, redirect to the main page
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    form = LoginForm()
    if form.validate_on_submit():
        # Find user by username
        user = User.query.filter_by(username=form.username.data).first()
        # Check if user exists and password is correct
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password', 'danger')
            return redirect(url_for('auth.login'))
        # Log the user in
        login_user(user, remember=form.remember_me.data)
        flash(f'Welcome back, {user.username}!', 'success')

        # Redirect to the next page if specified, otherwise to the index
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('main.index')
        return redirect(next_page)
    # Render the login template if GET request or form validation fails
    return render_template('auth/login.html', title='Log In', form=form)

@auth.route('/logout')
@login_required # Ensure only logged-in users can logout
def logout():
    """Handle requests to the /logout route."""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))