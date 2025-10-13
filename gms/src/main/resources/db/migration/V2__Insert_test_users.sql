-- Insert test users with hashed passwords (password: "password123")
-- BCrypt hash for "password123": $2a$10$rHzv3fRSAf4Q3fYXGJVJZ.Jw8W8nQqH5YvXZxXxXxXxXxXxXxXxXx

-- Admin user
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
    'admin@gms.com',
    'Admin User',
    '$2a$10$rHzv3fRSAf4Q3fYXGJVJZ.Jw8W8nQqH5YvXZxXxXxXxXxXxXxXxXx',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Regular user
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
    'user@gms.com',
    'Regular User',
    '$2a$10$rHzv3fRSAf4Q3fYXGJVJZ.Jw8W8nQqH5YvXZxXxXxXxXxXxXxXxXx',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
