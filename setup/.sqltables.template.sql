DROP TABLE IF EXISTS `CalendarEvents`;
CREATE TABLE `CalendarEvents` (
  `masterUUID`          varchar(128) NOT NULL,
  `uuid`                varchar(128) NOT NULL COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`               varchar(18)  NOT NULL,
  `start`               varchar(18)  NOT NULL,
  `end`                 varchar(18)  NOT NULL,
  `summary`             varchar(128) NOT NULL,
  `description`         varchar(1024),
  `location`            varchar(128),
  `isRecurring`         boolean      NOT NULL,
  `humanRecurrenceRule` varchar(512),
  `_recurrenceRule`     varchar(512),
  `_noMore`             boolean,
  `outdated`            varchar(18)
);

DROP TABLE IF EXISTS `Errors`;
CREATE TABLE `Errors` (
  `uuid`         varchar(128)                      NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `time`         varchar(18)                       NOT NULL,
  `version`      varchar(9)                        NOT NULL,
  `userAgent`    varchar(64),
  `platform`     enum('ios', 'android', 'backend') NOT NULL,
  `occurredAt`    varchar(128)                      NOT NULL,
  `error`        varchar(128)                      NOT NULL,
  `stack`        varchar(1024)                     NOT NULL,
  `msgOnReq`     varchar(1024),
  `sendMsgOnReq` varchar(18),
  `handled`      varchar(18)
);

DROP TABLE IF EXISTS `Feedback`;
CREATE TABLE `Feedback` (
  `uuid`         varchar(128)                      NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `time`         varchar(18)                       NOT NULL,
  `version`      varchar(9)                        NOT NULL,
  `userAgent`    varchar(64),
  `platform`     enum('ios', 'android', 'backend') NOT NULL,
  `name`         varchar(128),
  `email`        varchar(128),
  `content`      varchar(1024)                     NOT NULL,
  `msgOnReq`     varchar(1024),
  `sendMsgOnReq` varchar(18),
  `handled`      varchar(18)
);

DROP TABLE IF EXISTS `LastUpdate`;
CREATE TABLE `LastUpdate` (
  `category`   enum('calendar', 'lessonranges', 'menu', 'stand-in', 'teachers', 'timetables', 'endpoints', 'rooms') NOT NULL PRIMARY KEY,
  `lastUpdate` varchar(18)                                                                                        NOT NULL
);

DROP TABLE IF EXISTS `LessonRanges`;
CREATE TABLE `LessonRanges` (
  `uuid`          varchar(128) NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`         varchar(18)  NOT NULL,
  `discriminator` varchar(6)   NOT NULL,
  `time`          varchar(11)  NOT NULL,
  `outdated`      varchar(18)
);
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('00@nigb.app', 'DT1515151515151', '/1',   '-7:50');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('01@nigb.app', 'DT1515151515151', '0//1', '-7:50');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('02@nigb.app', 'DT1515151515151', '1',    '7:50-8:35');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('03@nigb.app', 'DT1515151515151', '2',    '8:40-9:25');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('04@nigb.app', 'DT1515151515151', '2//3', '9:25-9:45');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('05@nigb.app', 'DT1515151515151', '3',    '9:45-10:30');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('06@nigb.app', 'DT1515151515151', '4',    '10:35-11:20');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('07@nigb.app', 'DT1515151515151', '4//5', '11:20-11:40');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('08@nigb.app', 'DT1515151515151', '5',    '11:40-12:25');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('09@nigb.app', 'DT1515151515151', '6',    '12:30-13:15');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('10@nigb.app', 'DT1515151515151', '6/',   '13:15-');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('11@nigb.app', 'DT1515151515151', '6//7', '13:15-14:15');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('12@nigb.app', 'DT1515151515151', '7',    '14:15-15:00');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('13@nigb.app', 'DT1515151515151', '8',    '15:05-15:50');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('14@nigb.app', 'DT1515151515151', '9',    '16:00-16:45');
INSERT INTO `LessonRanges` (`uuid`, `added`, `discriminator`, `time`) VALUES('15@nigb.app', 'DT1515151515151', '10',   '16:50-17:35');
INSERT INTO `LastUpdate` (`category`, `lastUpdate`) VALUES('lessonranges', 'DT1515151515151');

DROP TABLE IF EXISTS `Menu`;
CREATE TABLE `Menu` (
  `uuid`       varchar(128) NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`      varchar(18)  NOT NULL,
  `day`        varchar(18)  NOT NULL,
  `default`    varchar(128) NOT NULL,
  `vegetarian` varchar(128),
  `desert`     varchar(128),
  `evening`    varchar(128),
  `outdated`   varchar(18)
);

DROP TABLE IF EXISTS `StandIn`;
CREATE TABLE `StandIn` (
  `uuid`            varchar(128)            NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`           varchar(18)  NOT NULL,
  `type`            enum('default', 'motd') NOT NULL,
  `subtype`         enum('other', 'absentClasses', 'absentTeachers'),
  `day`             varchar(18)             NOT NULL,
  `message`         varchar(256),
  `teacher`         varchar(64),
  `subject`         varchar(64),
  `lesson`          varchar(64),
  `class`           varchar(64),
  `room`            varchar(64),
  `originalTeacher` varchar(64),
  `originalSubject` varchar(64),
  `eliminated`      boolean,
  `outdated`        varchar(18)
);

DROP TABLE IF EXISTS `Teacher`;
CREATE TABLE `Teacher` (
  `uuid`       varchar(128) NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`      varchar(18)  NOT NULL,
  `leftSchool` boolean      NOT NULL,
  `shorthand`  varchar(2)   NOT NULL,
  `name`       varchar(128) NOT NULL,
  `subjects`   varchar(128) NOT NULL,
  `email`      varchar(128) NOT NULL,
  `comments`   varchar(512),
  `outdated`   varchar(18)
);

DROP TABLE IF EXISTS `Timetable`;
CREATE TABLE `Timetable` (
  `uuid`       varchar(128)                     NOT NULL PRIMARY KEY COLLATE latin1_general_cs, -- needed for case sensitivity
  `added`      varchar(18)                      NOT NULL,
  `type`       enum('teacher', 'room', 'class') NOT NULL,
  `master`     varchar(16)                      NOT NULL,
  `activation` varchar(128)                     NOT NULL,
  `content`    text(8192)                       NOT NULL,
  `outdated`   varchar(18)
);

DROP TABLE IF EXISTS `Endpoints`;
CREATE TABLE `Endpoints` (
  `version`       varchar(9)                        NOT NULL PRIMARY KEY,
  `platform`      enum('ios', 'android', 'backend') NOT NULL,
  `apiVersion`    varchar(9),
  `isRecommended` boolean                           NOT NULL,
  `isOutdated`    boolean                           NOT NULL,
  `devVersion`    boolean                           NOT NULL,
  UNIQUE INDEX `unique_index`(`version`, `platform`)
);
INSERT INTO `Endpoints` (`version`, `platform`, `apiVersion`, `isRecommended`, `isOutdated`, `devVersion`) VALUES('v0.0.0', 'android', 'v1.0.0', false, false, true);
INSERT INTO `LastUpdate` (`category`, `lastUpdate`) VALUES('endpoints', 'DT1515151515151');

DROP TABLE IF EXISTS `WebAdmins`;
CREATE TABLE `WebAdmins` (
  `id`            int          NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `hashAlgorithm` varchar(32)  NOT NULL,
  `username`      varchar(128) NOT NULL,
  `pwHash`        varchar(128) NOT NULL,
  `salt`          varchar(128) NOT NULL,
  `outdated`      varchar(18)
);
