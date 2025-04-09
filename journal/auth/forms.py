from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from ..models.user import User # Import User model to check for existing users

"""
Authentication related forms.

This module contains form classes used for user authentication operations
including login and registration.
"""

class LoginForm(FlaskForm):
    """Form for user authentication.
    
    This form handles user login credentials and remember-me functionality.
    
    Attributes:
        username (StringField): Field for entering username.
        password (PasswordField): Field for entering password.
        remember_me (BooleanField): Option to remain logged in.
        submit (SubmitField): Button to submit the form.
    """
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Keep me logged in')
    submit = SubmitField('Log In')

class RegistrationForm(FlaskForm):
    """Form for new user registration.
    
    This form collects and validates user registration information.
    
    Attributes:
        username (StringField): Field for choosing a username.
        email (StringField): Field for entering email address.
        password (PasswordField): Field for entering password.
        confirm_password (PasswordField): Field for confirming password.
        submit (SubmitField): Button to submit the form.
    """
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField(
        'Confirm Password',
        validators=[DataRequired(), EqualTo('password', message='Passwords must match.')]
    )
    submit = SubmitField('Register')

    # Custom validators to check if username or email already exist
    def validate_username(self, username):
        """Validate that the username is not already in use.
        
        Args:
            username (StringField): The username field to validate.
            
        Raises:
            ValidationError: If the username is already registered.
        """
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Username already taken. Please choose a different one.')

    def validate_email(self, email):
        """Validate that the email is not already registered.
        
        Args:
            email (StringField): The email field to validate.
            
        Raises:
            ValidationError: If the email is already registered.
        """
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Email address already registered. Please use a different one or log in.')