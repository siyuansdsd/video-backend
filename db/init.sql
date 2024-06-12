CREATE TABLE app_user (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    video_id VARCHAR(100)[],
    refresh_token VARCHAR(500),
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE video (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(100),
    url VARCHAR(100) NOT NULL,
    user_ids VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_ids) REFERENCES app_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_user (id, name, email, password, video_id) VALUES ('1', 'douglas', 'douglas@douglas.com', 'password', ARRAY['123','456']);
INSERT INTO video (id, title, description, url, user_ids) VALUES ('1', 'video1', 'description1', 'url1', '1');