INSERT INTO Users (email, nickname, status) VALUES
('user1@test.com', '첫번째사용자', 'ACTIVE'),
('user2@test.com', '두번째사용자', 'DORMANT');

INSERT INTO Devices (user_id, device_unique_id, device_name, power_status, open_status, mode_status, media_id) VALUES
(1, 'DEV_ABC_12345', '거실', TRUE, FALSE, 'DARK_MODE', NULL),
(2, 'DEV_XYZ_67890', '화장실', TRUE, TRUE, 'AUTO_MODE', NULL);