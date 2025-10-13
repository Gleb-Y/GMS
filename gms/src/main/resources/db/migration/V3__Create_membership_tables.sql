-- Create memberships table
CREATE TABLE memberships (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_memberships table (связь пользователь-абонемент)
CREATE TABLE user_memberships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    membership_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_user_membership_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_membership_membership 
        FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT chk_end_date_after_start CHECK (end_date >= start_date),
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'))
);

-- Create indexes for better performance
CREATE INDEX idx_memberships_name ON memberships(name);
CREATE INDEX idx_memberships_is_active ON memberships(is_active);
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_membership_id ON user_memberships(membership_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_user_memberships_end_date ON user_memberships(end_date);

-- Insert sample memberships
INSERT INTO memberships (name, price, duration_days, description, is_active)
VALUES 
    ('Базовый', 2000.00, 30, 'Месячный абонемент с доступом в тренажерный зал', true),
    ('Стандарт', 5000.00, 90, 'Квартальный абонемент с доступом в зал и бассейн', true),
    ('Премиум', 15000.00, 365, 'Годовой абонемент с полным доступом ко всем услугам', true),
    ('Пробный', 500.00, 7, 'Недельный пробный абонемент', true);

-- Insert sample user memberships (для тестирования)
-- Предполагаем, что user с id=1 (admin) и id=2 (user) уже существуют
INSERT INTO user_memberships (user_id, membership_id, start_date, end_date, status, notes)
VALUES 
    (6, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 'Первый абонемент пользователя');
