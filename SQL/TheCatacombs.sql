IF db_id('TheCatacombs') IS NULL
  CREATE DATABASE [TheCatacombs]
GO

USE [TheCatacombs]
GO
DROP TABLE IF EXISTS MOVIES
DROP TABLE IF EXISTS USERS
CREATE TABLE [Users] (
  [id] int PRIMARY KEY IDENTITY,
  [username] nvarchar(255),
  [email] nvarchar(255),
  [password] nvarchar(255)
)
GO

CREATE TABLE [Movies] (
  [id] int PRIMARY KEY IDENTITY,
  [userId] int,
  [title] nvarchar(255),
  [rating] int,
  [watched] bit,
  [poster_path] nvarchar(255),
  [overview] nvarchar(255),
  [popularity] numeric,
  [vote_average] decimal
)
GO

ALTER TABLE [Movies] ADD FOREIGN KEY ([userId]) REFERENCES [Users] ([id])
GO
