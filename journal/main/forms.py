from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length


class EntryForm(FlaskForm):
    """Form for creating and editing journal entries."""

    title = StringField("Title", validators=[DataRequired(), Length(min=1, max=140)])
    body = TextAreaField("Body", validators=[DataRequired()])
    tags = StringField(
        "Tags (comma-separated)"
    )  # Optional field, no validators needed for MVP+1

    submit = SubmitField("Save Entry")
