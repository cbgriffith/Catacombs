USE [TheCatacombs];
GO

set identity_insert [Users] on
insert into Users (id, username, email, [password]) values (1, 'admin', 'admin@admin.com', 123);
set identity_insert [Users] off


set identity_insert [Movies] on
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date, movieId) values (1, 1, 'Alien', 0, 1, '/bk9GVjN4kxmGekswNigaa5YIdr5.jpg', 'During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.', 52.437, 8.1, '1960-06-22', 348);
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date, movieId) values (2, 1, 'Psycho', 0, 0, '/w4zv2VO7Ca3G995bB6kLtc8q3kz.jpg', 'When larcenous real estate clerk Marion Crane goes on the lam with a wad of cash and hopes of starting a new life, she ends up at the notorious Bates Motel, where manager Norman Bates cares for his housebound mother.', 35.108, 8.4, '1960-06-22', 539);
insert into Movies (id, userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date, movieId) values (3, 1, 'The Shining', 0, 1, '/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg', 'Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, along with his wife Wendy and their son Danny, must live isolated from the rest of the world for the winter. But they aren''t prepared for the madness that lurks within.', 57.358, 8.2, '1960-06-22', 694);
set identity_insert [Movies] off