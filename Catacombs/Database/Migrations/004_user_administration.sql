ALTER TABLE users
    ADD COLUMN role varchar(32) NOT NULL DEFAULT 'user',
    ADD COLUMN is_banned boolean NOT NULL DEFAULT false,
    ADD COLUMN banned_at timestamp with time zone,
    ADD COLUMN banned_by_user_id integer,
    ADD COLUMN ban_reason varchar(500);

ALTER TABLE users
    ADD CONSTRAINT ck_users_role
        CHECK (role IN ('user', 'admin')),
    ADD CONSTRAINT ck_users_ban_state
        CHECK (
            (is_banned = true AND banned_at IS NOT NULL)
            OR
            (
                is_banned = false
                AND banned_at IS NULL
                AND banned_by_user_id IS NULL
                AND ban_reason IS NULL
            )
        ),
    ADD CONSTRAINT fk_users_banned_by
        FOREIGN KEY (banned_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL;
