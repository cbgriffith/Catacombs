CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_ci
    ON users (LOWER(username));
