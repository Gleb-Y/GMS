-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    bio VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create training_schedules table
CREATE TABLE IF NOT EXISTS training_schedules (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

-- Create training_bookings table
CREATE TABLE IF NOT EXISTS training_bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coach_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES training_schedules(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_coach_user ON coaches(user_id);
CREATE INDEX idx_coach_active ON coaches(is_active);
CREATE INDEX idx_schedule_coach ON training_schedules(coach_id);
CREATE INDEX idx_schedule_active ON training_schedules(is_active);
CREATE INDEX idx_schedule_time ON training_schedules(start_time);
CREATE INDEX idx_booking_user ON training_bookings(user_id);
CREATE INDEX idx_booking_coach ON training_bookings(coach_id);
CREATE INDEX idx_booking_schedule ON training_bookings(schedule_id);
CREATE INDEX idx_booking_cancelled ON training_bookings(is_cancelled);
