CREATE TABLE app_user (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    refresh_token VARCHAR(500),
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE video (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    url VARCHAR(200) NOT NULL,
    user_ids VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_ids) REFERENCES app_user(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    size INT NOT NULL
);

INSERT INTO app_user (id, name, email, password) VALUES ('1', 'douglas', 'douglas@douglas.com', 'password');
INSERT INTO video (id, title, description, url, user_ids, size) VALUES ('1', 'video1', 'description1', 'url1', '1', 1000);