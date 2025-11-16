-- Create lockers table
CREATE TABLE IF NOT EXISTS lockers (
    id BIGSERIAL PRIMARY KEY,
    locker_number VARCHAR(50) NOT NULL UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create locker_rents table
CREATE TABLE IF NOT EXISTS locker_rents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    locker_id BIGINT NOT NULL,
    rent_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_locker_available ON lockers(is_available);
CREATE INDEX idx_locker_rent_user ON locker_rents(user_id);
CREATE INDEX idx_locker_rent_locker ON locker_rents(locker_id);
CREATE INDEX idx_locker_rent_active ON locker_rents(is_active);
CREATE INDEX idx_locker_rent_date ON locker_rents(rent_date);
