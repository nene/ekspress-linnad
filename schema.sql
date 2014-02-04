--
-- Database schema for Towns and Distances system
--

-- use UTF-8 encoding and estonian collation on all tables
alter database
    default character set utf8
    default collate utf8_estonian_ci;


drop table if exists towns;
create table towns (
    id int not null,
    name varchar(100) not null,
    x int not null,  -- x and y coordinates on a graphical map
    y int not null,

    primary key (id)

) Engine=InnoDB;


drop table if exists distances;
create table distances (
    start int not null, -- distance from one town
    end int not null,   -- to another town
    length int unsigned not null, -- allow only positive distances

    primary key (start, end),
    foreign key (start) references towns (id)
        on delete cascade, -- distance can't exist without towns it connects
    foreign key (end) references towns (id)
        on delete cascade

) Engine=InnoDB;



--
-- Some example data
--

INSERT INTO towns VALUES (1, 'Tallinn', 335, 261);
INSERT INTO towns VALUES (2, 'Helsingi', 339, 184);
INSERT INTO towns VALUES (3, 'Stockholm', 2, 284);
INSERT INTO towns VALUES (4, 'Tartu', 460, 380);
INSERT INTO towns VALUES (5, 'Peterburg', 600, 180);
INSERT INTO towns VALUES (6, 'Narva', 512, 250);
INSERT INTO towns VALUES (7, 'Riia', 341, 513);

INSERT INTO distances VALUES (1, 2, 84);
INSERT INTO distances VALUES (2, 3, 396);
INSERT INTO distances VALUES (1, 4, 189);
INSERT INTO distances VALUES (1, 6, 212);
INSERT INTO distances VALUES (4, 6, 184);
INSERT INTO distances VALUES (5, 6, 127);
INSERT INTO distances VALUES (4, 7, 228);
