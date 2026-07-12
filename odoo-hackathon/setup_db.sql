-- TransitOps — MySQL Database Setup Script
-- Run once to create the database and user

CREATE DATABASE IF NOT EXISTS transitops_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'transitops_user'@'%' IDENTIFIED BY 'StrongPass123';
CREATE USER IF NOT EXISTS 'transitops_user'@'localhost' IDENTIFIED BY 'StrongPass123';

GRANT ALL PRIVILEGES ON transitops_db.* TO 'transitops_user'@'%';
GRANT ALL PRIVILEGES ON transitops_db.* TO 'transitops_user'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Database setup complete!' AS Status;
SHOW DATABASES LIKE 'transitops_db';
