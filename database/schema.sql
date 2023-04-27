PRAGMA foreign_keys = ON; -- ensures that ON DELETE CASCADE triggers are turned on

DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    id              INTEGER,
    email           VARCHAR(256)    UNIQUE  NOT NULL, -- maximum email length
    password        TEXT                    NOT NULL,
    nameFirst       VARCHAR(50)             NOT NULL,
    nameLast        VARCHAR(50)             NOT NULL,
    handleStr       TEXT            UNIQUE  NOT NULL, -- handleStr will generally be 20 chars with the exception of duplicate handleStrs
    permission      INTEGER                 NOT NULL DEFAULT 2, -- if not explicitly casted the user will be global member
    resetCode       VARCHAR(36)     DEFAULT '', -- resetCodes will not exceed 36 characters according to resetCode generation
    profileImgUrl   TEXT,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS User_Tokens;
CREATE TABLE User_Tokens (
    user    INTEGER,
    token   VARCHAR(64), -- sha256 always produces 64 characters 
    PRIMARY KEY (token),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS User_Tokens_user;
CREATE INDEX User_Tokens_user ON User_Tokens(user); --> Users(id)

DROP TABLE IF EXISTS Channels;
CREATE TABLE Channels (
    id                  INTEGER,
    name                VARCHAR(20) NOT NULL,
    isPublic            BOOLEAN     NOT NULL,
    standupOwner        INTEGER DEFAULT NULL,
    standupIsActive     BOOLEAN DEFAULT FALSE,
    standupTimeFinish   INTEGER DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (standupOwner) REFERENCES Users(id) ON DELETE SET NULL
);
DROP INDEX IF EXISTS Channels_standupOwner;
CREATE INDEX Channels_standupOwner ON 'Channels'('standupOwner'); --> Users(id)

DROP TABLE IF EXISTS Standups;
CREATE TABLE Standups (
    channel         INTEGER,
    message         VARCHAR(1024),
    FOREIGN KEY (channel) REFERENCES Channels(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Standups_channel;
CREATE INDEX Standups_channel ON Standups(channel); --> Channels(id)

DROP TABLE IF EXISTS Channel_Members;
CREATE TABLE Channel_Members (
    user        INTEGER,
    channel     INTEGER,
    PRIMARY KEY (user, channel),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel) REFERENCES Channels(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Channel_Members_channel;
CREATE INDEX Channel_Members_channel ON Channel_Members(channel); --> Channels(id)

DROP TABLE IF EXISTS Channel_Owners;
CREATE TABLE Channel_Owners (
    user        INTEGER,
    channel     INTEGER,
    PRIMARY KEY (user, channel),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel) REFERENCES Channels(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Channel_Owners_channel;
CREATE INDEX Channel_Owners_channel ON Channel_Owners(channel); --> Channels(id)

DROP TABLE IF EXISTS Channel_Messages;
CREATE TABLE Channel_Messages (
    insertOrder INTEGER PRIMARY KEY AUTOINCREMENT,
    id          INTEGER UNIQUE,
    user        INTEGER,
    channel     INTEGER,
    message     VARCHAR(1000),
    timeSent    INTEGER DEFAULT (strftime('%s', 'now')),
    isPinned    BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE SET NULL, -- even if the user is deleted, their message remains
    FOREIGN KEY (channel) REFERENCES Channels(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Channel_Messages_id;
CREATE INDEX Channel_Messages_id ON Channel_Messages(id);

DROP INDEX IF EXISTS Channel_Messages_channel;
CREATE INDEX Channel_Messages_channel ON Channel_Messages(channel); --> Channels(id)

DROP INDEX IF EXISTS Channel_Messages_user;
CREATE INDEX Channel_Messages_user ON Channel_Messages(user); --> Users(id)

DROP TABLE IF EXISTS Channel_Message_Reacts;
CREATE TABLE Channel_Message_Reacts (
    id          INTEGER,
    reactId     INTEGER NOT NULL,
    user        INTEGER,
    message     INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (message) REFERENCES Channel_Messages(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Channel_Message_Reacts_message;
CREATE INDEX Channel_Message_Reacts_message ON Channel_Message_Reacts(message); --> Channel_Messages(id)

DROP TABLE IF EXISTS Dms;
CREATE TABLE Dms (
    id      INTEGER,
    name    TEXT,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS Dm_Members;
CREATE TABLE Dm_Members (
    user        INTEGER,
    dm          INTEGER,
    PRIMARY KEY (user, dm),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (dm) REFERENCES Dms(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Dm_Members_dm;
CREATE INDEX Dm_Members_dm ON Dm_Members(dm); --> Dms(id)

DROP TABLE IF EXISTS Dm_Owners;
CREATE TABLE Dm_Owners (
    user        INTEGER,
    dm          INTEGER,
    PRIMARY KEY (user, dm),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (dm) REFERENCES Dms(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Dm_Owners_dm;
CREATE INDEX Dm_Owners_dm ON Dm_Owners(dm); --> Dms(id)

DROP TABLE IF EXISTS Dm_Messages;
CREATE TABLE Dm_Messages (
    insertOrder INTEGER PRIMARY KEY AUTOINCREMENT,
    id          INTEGER UNIQUE,
    user        INTEGER,
    dm          INTEGER,
    message     VARCHAR(1000),
    timeSent    INTEGER DEFAULT (strftime('%s', 'now')),
    isPinned    BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE SET NULL, -- even if the user is deleted, their message remains
    FOREIGN KEY (dm) REFERENCES Dms(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Dm_Messages_id;
CREATE INDEX Dm_Messages_id ON Dm_Messages(id);

DROP INDEX IF EXISTS Dm_Messages_dm;
CREATE INDEX Dm_Messages_dm ON Dm_Messages(dm); --> Dms(id)

DROP INDEX IF EXISTS Dm_Messages_user;
CREATE INDEX Dm_Messages_user ON Dm_Messages(user); --> Users(id)

DROP TABLE IF EXISTS Dm_Message_Reacts;
CREATE TABLE Dm_Message_Reacts (
    id          INTEGER,
    reactId     INTEGER,
    user        INTEGER,
    message     INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (message) REFERENCES Dm_Messages(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Dm_Message_Reacts_message;
CREATE INDEX Dm_Message_Reacts_message ON Dm_Message_Reacts(message); --> Dm_Messages(id)

DROP TABLE IF EXISTS Notifications;
CREATE TABLE Notifications (
    id          INTEGER,
    user        INTEGER DEFAULT NULL,
    channel     INTEGER DEFAULT NULL,
    dm          INTEGER,
    message     varchar(1024),
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel) REFERENCES Channels(id) ON DELETE SET NULL,
    FOREIGN KEY (dm) REFERENCES Dms(id) ON DELETE SET NULL
);
DROP INDEX IF EXISTS Notifications_dm;
CREATE INDEX Notifications_dm ON Notifications(dm); --> Dms(id)

DROP INDEX IF EXISTS Notifications_channel;
CREATE INDEX Notifications_channel ON Notifications(channel); --> Channels(id)

DROP INDEX IF EXISTS Notifications_user;
CREATE INDEX Notifications_user ON Notifications(user); --> Users(id)

DROP TABLE IF EXISTS Stat_Channels_Joined;
CREATE TABLE Stat_Channels_Joined (
    id          INTEGER,
    user        INTEGER,
    numChannels INTEGER NOT NULL,
    timeStamp   INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Stat_Channels_Joined_user;
CREATE INDEX Stat_Channels_Joined_user ON Stat_Channels_Joined(user); --> Users(id)

DROP TABLE IF EXISTS Stat_Dms_Joined;
CREATE TABLE Stat_Dms_Joined (
    id          INTEGER,
    user        INTEGER,
    numDms      INTEGER NOT NULL,
    timeStamp   INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Stat_Dms_Joined_user;
CREATE INDEX Stat_Dms_Joined_user ON Stat_Dms_Joined(user); --> Users(id)

DROP TABLE IF EXISTS Stat_Messages_Sent;
CREATE TABLE Stat_Messages_Sent (
    id              INTEGER,
    user            INTEGER,
    messagesSent    INTEGER NOT NULL,
    timeStamp       INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES Users(id) ON DELETE CASCADE
);
DROP INDEX IF EXISTS Stat_Messages_Sent_user;
CREATE INDEX Stat_Messages_Sent_user ON Stat_Messages_Sent(user); --> Users(id)

DROP TABLE IF EXISTS Channels_Exist;
CREATE TABLE Channels_Exist (
    id                  INTEGER,
    numChannelsExist    INTEGER NOT NULL,
    timeStamp           INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS Dms_Exist;
CREATE TABLE Dms_Exist (
    id                  INTEGER,
    numDmsExist         INTEGER NOT NULL,
    timeStamp           INTEGER DEFAULT (strftime('%s', 'now')),
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS Messages_Exist;
CREATE TABLE Messages_Exist (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    numMessagesExist    INTEGER NOT NULL,
    timeStamp           INTEGER DEFAULT (strftime('%s', 'now'))
);

-- initialize the workspace stats to have a zero value
INSERT INTO Channels_Exist (numChannelsExist) VALUES (0);
INSERT INTO Dms_Exist      (numDmsExist)      VALUES (0);
INSERT INTO Messages_Exist (numMessagesExist) VALUES (0);