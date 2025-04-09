from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user, login_required
from . import auth  # Import the blueprint instance
from .forms import LoginForm, RegistrationForm
from .. import db  # Import the database instance
from ..models.user import User  # Import the User model


@auth.route("/register", methods=["GET", "POST"])
def register():
    """
    Handles user registration process.

    This route manages both the display of the registration form (GET) and the
    processing of form submissions (POST). It performs validation including checking
    for duplicate usernames/emails before creating a new user account.

    Request:
        - GET: Displays the registration form
        - POST: Processes the submitted form data
          - username: Unique username for the new account
          - email: Unique email address
          - password: User's password (will be hashed)
          - password2: Password confirmation (must match password)

    Response:
        - GET: Renders register.html template with registration form
        - POST (success): Redirects to login page with success message
        - POST (failure): Redirects back to registration form with error message

    Notes:
        - Already authenticated users are redirected to the main page
        - Passwords are securely hashed before storage
    """
    # If user is already logged in, redirect to the main page
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))

    form = RegistrationForm()
    if form.validate_on_submit():
        # Check for existing username
        existing_user = User.query.filter_by(username=form.username.data).first()
        if existing_user:
            flash("Username already taken.", "warning")
            return redirect(url_for("auth.register"))
        # Check for existing email
        existing_email = User.query.filter_by(email=form.email.data).first()
        if existing_email:
            flash("Email already in use.", "warning")
            return redirect(url_for("auth.register"))

        # Create new user instance
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        # Add user to the database session and commit
        db.session.add(user)
        db.session.commit()
        flash("Congratulations, you are now a registered user!", "success")
        # Redirect to the login page after successful registration
        return redirect(url_for("auth.login"))
    # Render the registration template if GET request or form validation fails
    return render_template("auth/register.html", title="Register", form=form)


@auth.route("/login", methods=["GET", "POST"])
def login():
    """
    Handles user authentication and login process.

    This route manages both the display of the login form (GET) and the
    processing of form submissions (POST). It authenticates users against the database
    and creates a session using Flask-Login if credentials are valid.

    Request:
        - GET: Displays the login form
        - POST: Processes the submitted form data
          - username: User's registered username
          - password: User's password
          - remember_me: Boolean field for persistent session

    Response:
        - GET: Renders login.html template with login form
        - POST (success): Redirects to main page or next URL parameter with welcome message
        - POST (failure): Redirects back to login form with error message

    Notes:
        - Already authenticated users are redirected to the main page
        - Supports 'next' URL parameter for redirecting to protected pages after login
        - Performs security checks on the 'next' parameter to prevent open redirects
    """
    # If user is already logged in, redirect to the main page
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))

    form = LoginForm()
    if form.validate_on_submit():
        # Find user by username
        user = User.query.filter_by(username=form.username.data).first()
        # Check if user exists and password is correct
        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password", "danger")
            return redirect(url_for("auth.login"))
        # Log the user in
        login_user(user, remember=form.remember_me.data)
        flash(f"Welcome back, {user.username}!", "success")

        # Redirect to the next page if specified, otherwise to the index
        next_page = request.args.get("next")
        if not next_page or not next_page.startswith("/"):
            next_page = url_for("main.index")
        return redirect(next_page)
    # Render the login template if GET request or form validation fails
    return render_template("auth/login.html", title="Log In", form=form)


@auth.route("/logout")
@login_required  # Ensure only logged-in users can logout
def logout():
    """
    Handles user logout process.

    This route terminates the user's session using Flask-Login's logout_user() function.
    It requires the user to be authenticated before access (login_required decorator).

    Request:
        - GET: Processes logout request

    Response:
        - Redirects to the main page with a logout confirmation message

    Security:
        - Protected by login_required decorator
        - Only accessible to authenticated users
    """
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("main.index"))
