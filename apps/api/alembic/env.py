import logging
import os

from logging.config import fileConfig


# Suppress duplicate logging
logging.getLogger('alembic.runtime.migration').setLevel(logging.WARNING)

from sqlalchemy import create_engine, pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.engine.url import make_url
from sqlmodel import SQLModel

from alembic import context

# Import all models for autogenerate support
from app.infra.models import Entry, Event  # noqa: F401
from app.settings import settings


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Use environment variable override if present, otherwise use settings
if os.environ.get("DATABASE_URL_SYNC"):
    override_url = os.environ["DATABASE_URL_SYNC"]
    config.set_main_option("sqlalchemy.url", override_url)
    print(f"[alembic] Using DATABASE_URL_SYNC override: {override_url}")
else:
    # Use settings
    config.set_main_option("sqlalchemy.url", settings.db_url)
    print(f"[alembic] Using settings.db_url: {settings.db_url}")

# Force sync driver (psycopg2) for migrations
raw_url = config.get_main_option("sqlalchemy.url")
url = make_url(raw_url)
if url.drivername and "postgresql" in url.drivername and "psycopg2" not in url.drivername:
    # Convert asyncpg or any other postgres driver to psycopg2
    url = url.set(drivername="postgresql+psycopg2")
    config.set_main_option("sqlalchemy.url", str(url))
    print(f"[alembic] Converted driver to sync: {url.drivername}")
else:
    print(f"[alembic] Using driver: {url.drivername}")

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


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

    # --- begin probe ---
    from sqlalchemy.engine.url import make_url

    url_str = config.get_main_option("sqlalchemy.url")
    url = make_url(url_str)
    print(f"[alembic] sqlalchemy.url={url!s}")
    print(f"[alembic] driver={url.drivername}, host={url.host}, database={url.database}")

    # Create sync engine
    connectable = create_engine(url_str, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        # Probe the actual connection
        row = connection.execute(text("select current_database(), version(), current_setting('application_name', true)")).first()
        print(f"[alembic] current_database={row[0]}")
        print(f"[alembic] postgres_version={row[1][:20]}...")
        print(f"[alembic] application_name={row[2]}")
        # --- end probe ---

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            transactional_ddl=True
        )

        with context.begin_transaction():
            context.run_migrations()
            connection.commit()  # Explicitly commit

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
