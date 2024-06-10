CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    videoIdList VARCHAR(100)[]
);

CREATE TABLE videos (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(100),
    url VARCHAR(100) NOT NULL,
    userId VARCHAR(100) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email, password, videoIdList) VALUES ('1', 'douglas', 'douglas@douglas.com', 'password', ARRAY['123','456']);
INSERT INTO videos (id, title, description, url, userId) VALUES ('1', 'video1', 'description1', 'url1', '1');