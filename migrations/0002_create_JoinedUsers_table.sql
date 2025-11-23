-- Migration number: 0002 	 2025-11-23T20:19:32.273Z
CREATE TABLE IF NOT EXISTS JoinedUsers(
  userId TEXT NOT NULL,
  messageId TEXT NOT NULL,
  joinedAt INTEGER NOT NULL,
  PRIMARY KEY (userId, messageId)
);
