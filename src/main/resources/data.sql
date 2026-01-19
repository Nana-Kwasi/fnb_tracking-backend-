-- Default admin user (password: admin123)
INSERT INTO users (password, f_number, role, is_active, created_at, updated_at)
VALUES ('admin123', 'F001', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (f_number) DO NOTHING;

-- Default normal user (password: password123)
INSERT INTO users (password, f_number, role, is_active, created_at, updated_at)
VALUES ('password123', 'F002', 'NORMAL_USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (f_number) DO NOTHING;
