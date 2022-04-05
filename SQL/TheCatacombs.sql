IF db_id('TheCatacombs') IS NULL
  CREATE DATABASE [TheCatacombs]
GO

USE [TheCatacombs]
GO

CREATE TABLE [Users] (
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [username] nvarchar(255),
  [email] nvarchar(255),
  [password] nvarchar(255)
)
GO

CREATE TABLE [Movies] (
  [id] int,
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
