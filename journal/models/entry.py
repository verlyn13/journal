from datetime import datetime, timezone
from journal import db

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(140), nullable=False)
    body = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), index=True, default=lambda: datetime.now(timezone.utc)) # Use timezone-aware default
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Corrected table name

    def __repr__(self):
        return f'<Entry {self.title}>'