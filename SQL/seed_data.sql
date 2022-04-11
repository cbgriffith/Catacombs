USE [TheCatacombs];
GO

set identity_insert [Users] on
insert into Users (id, username, email, [password]) values (1, 'admin', 'admin@admin.com', 123);
set identity_insert [Users] off


set identity_insert [Movies] on
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date) values (1, 1, 'Test', 0, 1, 'string', 'string', 0, 0, '1960-06-22');
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date) values (2, 1, 'Psycho', 0, 1, 'string', 'When larcenous real estate clerk Marion Crane goes on the lam with a wad of cash and hopes of starting a new life, she ends up at the notorious Bates Motel, where manager Norman Bates cares for his housebound mother.', 0, 0, '1960-06-22');
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date) values (3, 1, 'The Shining', 0, 1, '/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg', 'Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, along with his wife Wendy and their son Danny, must live isolated from the rest of the world for the winter. But they aren''t prepared for the madness that lurks within.', 59.4, 8.2, '1960-06-22');
set identity_insert [Movies] off