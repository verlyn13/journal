from datetime import datetime

from journal import db

from .tag import entry_tags


class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(140), nullable=False)
    body = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)  # Store naive UTC
    user_id = db.Column(
        db.Integer, db.ForeignKey('users.id'), nullable=False
    )  # Corrected table name

    tags = db.relationship(
        'Tag',
        secondary=entry_tags,
        lazy='subquery',
        backref=db.backref('entries', lazy=True),
    )

    def __repr__(self):
        return f'<Entry {self.title}>'
