-- Migration number: 0001 	 2025-11-23T20:16:10.348Z
CREATE TABLE IF NOT EXISTS LookingForGroupMessages (
   messageId TEXT PRIMARY KEY NOT NULL,
   content TEXT NOT NULL,
   startTime INTEGER NULL,
   createdBy TEXT NOT NULL,
   createdAt INTEGER NOT NULL
);
