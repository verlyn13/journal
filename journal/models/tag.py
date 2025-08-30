from datetime import datetime  # Use naive UTC

from journal import db

# Association Table for Many-to-Many relationship between Entry and Tag
entry_tags = db.Table(
    'entry_tags',
    db.Column('entry_id', db.Integer, db.ForeignKey('entry.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True),
)


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Store naive UTC

    # Relationship backref defined in Entry model ('entries')

    def __repr__(self):
        return f'<Tag {self.name}>'
