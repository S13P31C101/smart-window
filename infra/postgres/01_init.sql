-- 1. ENUM (열거형) 타입 정의

CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE', 
    'DORMANT', 
    'SUSPENDED'
);

CREATE TYPE social_provider_enum AS ENUM (
    'GOOGLE',
    'KAKAO',
    'NAVER'
);

CREATE TYPE device_mode_enum AS ENUM (
    'AUTO_MODE', 
    'DARK_MODE', 
    'SLEEP_MODE',
    'CUSTOM_MODE'
);

CREATE TYPE media_type_enum AS ENUM (
    'IMAGE', 
    'VIDEO'
);

CREATE TYPE media_origin_enum AS ENUM (
    'ORIGINAL', 
    'AI_GENERATED'
);

CREATE TYPE permission_level_enum AS ENUM (
    'OWNER', 
    'MEMBER'
);


-- 2. 테이블 생성

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP NULL,
    status user_status_enum DEFAULT 'ACTIVE' NOT NULL
);

CREATE TABLE user_social_accounts (
    social_id VARCHAR(255) NOT NULL,
    provider social_provider_enum NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (social_id, provider)
);

CREATE TABLE mobiles (
    token VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type media_type_enum NOT NULL,
    file_size BIGINT NULL,
    resolution VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_media_id BIGINT NULL REFERENCES media(id) ON DELETE CASCADE,
    origin_type media_origin_enum NOT NULL
);

CREATE TABLE devices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_unique_id VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    power_status BOOLEAN DEFAULT FALSE NOT NULL,
    open_status BOOLEAN DEFAULT FALSE NOT NULL,
    mode_status device_mode_enum DEFAULT 'AUTO_MODE' NOT NULL,
    mode_settings JSONB NULL,
    media_id BIGINT NULL REFERENCES media(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE alarms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    alarm_name VARCHAR(100) NOT NULL,
    alarm_time TIME NOT NULL,
    repeat_days VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
CREATE TABLE device_groups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_name VARCHAR(100) NOT NULL
);

CREATE TABLE device_group_members (
    group_id BIGINT NOT NULL REFERENCES device_groups(id) ON DELETE CASCADE,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, device_id)
);

CREATE TABLE user_device_permissions (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    permission_level permission_level_enum NULL,
    PRIMARY KEY (user_id, device_id)
);
--


-- 3. 인덱스

CREATE INDEX idx_devices_user_id ON devices (user_id);
CREATE INDEX idx_media_user_id ON media (user_id);
CREATE INDEX idx_media_parent_media_id ON media (parent_media_id);
CREATE INDEX idx_alarms_device_id ON alarms (device_id);
CREATE INDEX idx_user_social_accounts_user_id ON user_social_accounts (user_id);
CREATE INDEX idx_mobiles_user_id ON mobiles (user_id);