DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users) THEN
        RAISE EXCEPTION
            'The password migration requires an empty users table so plaintext passwords are not mistaken for password hashes.';
    END IF;
END
$$;

ALTER TABLE users
    RENAME COLUMN password TO password_hash;

ALTER TABLE users
    ALTER COLUMN password_hash TYPE varchar(512);

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS uq_users_email;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_normalized
    ON users (lower(email));
