-- Insert test users with hashed passwords (password: "password123")
-- BCrypt hash for "password123": $2a$10$rHzv3fRSAf4Q3fYXGJVJZ.Jw8W8nQqH5YvXZxXxXxXxXxXxXxXxXx

-- Admin user
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
    'admin2@gms.com',
    'Admin User 2',
    '$2a$10$uiOfFZ8a91MOpr6FYAs6CO5JPranKdfXN7GvexzRXZIUu4e5zd0iu',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Regular user
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
    'user2@gms.com',
    'Regular User 2',
    '$2a$10$uiOfFZ8a91MOpr6FYAs6CO5JPranKdfXN7GvexzRXZIUu4e5zd0iu',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
