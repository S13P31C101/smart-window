-- 1. ENUM (열거형) 타입 정의

CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE', 
    'DORMANT', 
    'SUSPENDED'
);

CREATE TYPE device_mode_enum AS ENUM (
    'AUTO_MODE', 
    'DARK_MODE', 
    'SLEEP_MODE'
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

CREATE TABLE "Users" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "nickname" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "last_login_at" TIMESTAMP NULL,
    "status" user_status_enum DEFAULT 'ACTIVE' NOT NULL
);

CREATE TABLE "User_Social_Accounts" (
    "social_id" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(20) NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    PRIMARY KEY ("social_id", "provider")
);

CREATE TABLE "Mobile" (
    "token" VARCHAR(255) PRIMARY KEY,
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "last_used_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Media" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_type" media_type_enum NOT NULL,
    "file_size" BIGINT NULL,
    "resolution" VARCHAR(50) NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "parent_media_id" BIGINT NULL REFERENCES "Media"("id") ON DELETE CASCADE,
    "origin_type" media_origin_enum NOT NULL
);

CREATE TABLE "Devices" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "device_unique_id" VARCHAR(255) NOT NULL UNIQUE,
    "device_name" VARCHAR(100) NOT NULL,
    "power_status" BOOLEAN DEFAULT FALSE NOT NULL,
    "open_status" BOOLEAN DEFAULT FALSE NOT NULL,
    "mode_status" device_mode_enum DEFAULT 'AUTO_MODE' NOT NULL,
    "media_id" BIGINT NULL REFERENCES "Media"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Alarms" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "device_id" BIGINT NOT NULL REFERENCES "Devices"("id") ON DELETE CASCADE,
    "alarm_name" VARCHAR(100) NOT NULL,
    "alarm_time" TIME NOT NULL,
    "repeat_days" VARCHAR(100) NULL,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
CREATE TABLE "Device_Groups" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "group_name" VARCHAR(100) NOT NULL
);

CREATE TABLE "Device_Group_Members" (
    "group_id" BIGINT NOT NULL REFERENCES "Device_Groups"("id") ON DELETE CASCADE,
    "device_id" BIGINT NOT NULL REFERENCES "Devices"("id") ON DELETE CASCADE,
    PRIMARY KEY ("group_id", "device_id")
);

CREATE TABLE "User_Device_Permissions" (
    "user_id" BIGINT NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "device_id" BIGINT NOT NULL REFERENCES "Devices"("id") ON DELETE CASCADE,
    "permission_level" permission_level_enum NULL,
    PRIMARY KEY ("user_id", "device_id")
);
--


-- 3. 인덱스

CREATE INDEX "IDX_Devices_user_id" ON "Devices" ("user_id");
CREATE INDEX "IDX_Media_user_id" ON "Media" ("user_id");
CREATE INDEX "IDX_Media_parent_media_id" ON "Media" ("parent_media_id");
CREATE INDEX "IDX_Alarms_device_id" ON "Alarms" ("device_id");
CREATE INDEX "IDX_User_Social_Accounts_user_id" ON "User_Social_Accounts" ("user_id");
CREATE INDEX "IDX_Mobile_user_id" ON "Mobile" ("user_id");