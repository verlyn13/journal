"""SQLAlchemy 2.0 base configuration with proper typing."""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass

# Naming convention for constraints (Alembic migrations)
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(MappedAsDataclass, DeclarativeBase):
    """Base class for all SQLAlchemy models with SQLAlchemy 2.0 typing."""

    metadata = metadata
    # Enable dataclass behavior but allow SQLAlchemy to handle __init__
    __init_subclass_kw__ = {"init": False}