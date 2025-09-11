import logging
import os

from logging.config import fileConfig

# Suppress duplicate logging
logging.getLogger("alembic.runtime.migration").setLevel(logging.WARNING)

from sqlalchemy import create_engine, pool, text
from sqlmodel import SQLModel

from alembic import context

# Import all models for autogenerate support
from app.infra.models import Entry, Event, User, UserSession  # noqa: F401
from app.settings import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Use environment variable override if present, otherwise use settings.db_url_sync
if os.environ.get("DATABASE_URL_SYNC"):
    db_url_sync = os.environ["DATABASE_URL_SYNC"]
else:
    # Use settings.db_url_sync (already in sync format)
    db_url_sync = settings.db_url_sync

config.set_main_option("sqlalchemy.url", db_url_sync)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = SQLModel.metadata

# other values from the config can be acquired if needed by env.py


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using sync engine."""
    
    url_str = config.get_main_option("sqlalchemy.url")
    if url_str is None:
        raise ValueError("sqlalchemy.url is not configured")
    
    # Create sync engine with psycopg (v3) or psycopg2
    connectable = create_engine(url_str, poolclass=pool.NullPool, future=True)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            transactional_ddl=True,
            compare_type=True,
            version_table_schema="public",
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
