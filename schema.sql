
-- add looking for group messages table
CREATE TABLE IF NOT EXISTS LookingForGroupMessages (
messageId INTEGER PRIMARY KEY NOT NULL,
content TEXT NOT NULL,
startTime INTEGER NULL,
createdBy INTEGER NOT NULL,
createdAt INTEGER NOT NULL
);

-- add joined users table
CREATE TABLE IF NOT EXISTS JoinedUsers(
userId INTEGER NOT NULL,
messageId INTEGER NOT NULL,
joinedAt INTEGER NOT NULL,
PRIMARY KEY (userId, messageId)
);