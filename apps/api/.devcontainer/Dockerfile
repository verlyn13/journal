FROM mcr.microsoft.com/devcontainers/python:3.12

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    postgresql-client \
    redis-tools \
    vim \
    zsh \
    && rm -rf /var/lib/apt/lists/*

# Install uv (modern Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Install Node.js and bun for frontend development
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g bun

# Set up user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create the user if it doesn't exist
RUN if ! getent passwd $USERNAME > /dev/null 2>&1; then \
        groupadd --gid $USER_GID $USERNAME \
        && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
        && apt-get update \
        && apt-get install -y sudo \
        && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
        && chmod 0440 /etc/sudoers.d/$USERNAME; \
    fi

# Switch to user
USER $USERNAME

# Install uv for the user
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/home/$USERNAME/.cargo/bin:$PATH"

# Set up Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set the default shell to zsh
ENV SHELL=/usr/bin/zsh

# Set working directory
WORKDIR /workspace

# Copy requirements first for better caching
COPY pyproject.toml uv.lock* ./

# Install Python dependencies
RUN uv sync --all-extras --dev

# Install pre-commit hooks
RUN uv run pre-commit install

# Set environment variables for development
ENV PYTHONPATH=/workspace
ENV JOURNAL_LOG_LEVEL=DEBUG
ENV JOURNAL_ENVIRONMENT=development

# Expose ports
EXPOSE 8000

# Default command
CMD ["sleep", "infinity"]