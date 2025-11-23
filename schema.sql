-- this is primarily just for reference

-- add looking for group messages table
CREATE TABLE IF NOT EXISTS LookingForGroupMessages (
messageId TEXT PRIMARY KEY NOT NULL,
content TEXT NOT NULL,
startTime INTEGER NULL,
createdBy TEXT NOT NULL,
createdAt INTEGER NOT NULL
);

-- add joined users table
CREATE TABLE IF NOT EXISTS JoinedUsers(
userId TEXT NOT NULL,
messageId TEXT NOT NULL,
joinedAt INTEGER NOT NULL,
PRIMARY KEY (userId, messageId)
);