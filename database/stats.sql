-- this file contains the triggers for workspace stats
-- as well as user stats

-- initialize the user stats of a newly inserted user
DROP TRIGGER IF EXISTS Stat_User_Inserted_Trigger;
CREATE TRIGGER Stat_User_Inserted_Trigger 
AFTER INSERT ON Users
BEGIN
    INSERT INTO Stat_Dms_Joined (user, numDms) VALUES (NEW.id, 0);
    INSERT INTO Stat_Channels_Joined (user, numChannels) VALUES (NEW.id, 0);
    INSERT INTO Stat_Messages_Sent (user, messagesSent) VALUES (NEW.id, 0);
END;

-- updates the number of dms joined by a user after a insert
DROP TRIGGER IF EXISTS Stat_Dms_Joined_Trigger;
CREATE TRIGGER Stat_Dms_Joined_Trigger
AFTER INSERT ON dm_members
BEGIN
    INSERT INTO Stat_Dms_Joined (user, numDms)
        SELECT NEW.user, COUNT(*)
        FROM dm_members
        WHERE user = NEW.user;
END;

-- updates the number of dms joined by a user after a delete
DROP TRIGGER IF EXISTS Stat_Dms_Joined_Trigger_On_Delete;
CREATE TRIGGER Stat_Dms_Joined_Trigger_On_Delete
AFTER DELETE ON dm_members
BEGIN
    INSERT INTO Stat_Dms_Joined (user, numDms)
        SELECT OLD.user, COUNT(*)
        FROM dm_members
        WHERE user = OLD.user;
END;

-- updates the number of channels joined by a user after a insert
DROP TRIGGER IF EXISTS Stat_Channels_Joined_Trigger;
CREATE TRIGGER Stat_Channels_Joined_Trigger
AFTER INSERT ON channel_members
BEGIN
    INSERT INTO Stat_Channels_Joined (user, numChannels)
        SELECT NEW.user, COUNT(*)
        FROM channel_members
        WHERE user = NEW.user;
END;

-- updates the number of channels joined by a user after a delete
DROP TRIGGER IF EXISTS Stat_Channels_Joined_Trigger_On_Delete;
CREATE TRIGGER Stat_Channels_Joined_Trigger_On_Delete
AFTER DELETE ON channel_members
BEGIN
    INSERT INTO Stat_Channels_Joined (user, numChannels)
        SELECT OLD.user, COUNT(*)
        FROM channel_members
        WHERE user = OLD.user;
END;

-- increments previous num of messages sent by 1 from a user (ignores message deletes)
DROP TRIGGER IF EXISTS Stat_Messages_Sent;
CREATE TRIGGER Stat_Messages_Sent
AFTER INSERT ON Channel_Messages
BEGIN
    INSERT INTO Stat_Messages_Sent (user, messagesSent)
        SELECT user, MAX(messagesSent) + 1
        FROM Stat_Messages_Sent
        WHERE user = NEW.user;

    INSERT INTO Messages_Exist (numMessagesExist)
        SELECT numMessagesExist + 1
        FROM Messages_Exist
        ORDER BY id DESC
        LIMIT 1;
END;

-- incrementaions previous num of message sent by 1 from a user (ignores message deletes)
DROP TRIGGER IF EXISTS Stat_Messages_Sent_Dm;
CREATE TRIGGER Stat_Messages_Sent_Dm
AFTER INSERT ON Dm_Messages
BEGIN
    INSERT INTO Stat_Messages_Sent (user, messagesSent)
        SELECT user, MAX(messagesSent) + 1
        FROM Stat_Messages_Sent
        WHERE user = NEW.user;
    
    INSERT INTO Messages_Exist (numMessagesExist)
        SELECT numMessagesExist + 1
        FROM Messages_Exist
        ORDER BY id DESC
        LIMIT 1;
END;

-- decrement previous number of messages exist on delete
DROP TRIGGER IF EXISTS Stat_Messages_Channel_On_Delete;
CREATE TRIGGER Stat_Messages_Channel_On_Delete
AFTER DELETE ON Channel_Messages
BEGIN
    INSERT INTO Messages_Exist (numMessagesExist)
        SELECT numMessagesExist - 1
        FROM Messages_Exist
        ORDER BY id DESC
        LIMIT 1;
END;

-- decrement previous number of messages exist on delete
DROP TRIGGER IF EXISTS Stat_Messages_Channel_On_Delete;
CREATE TRIGGER Stat_Messages_Channel_On_Delete
AFTER DELETE ON Dm_Messages
BEGIN
    INSERT INTO Messages_Exist (numMessagesExist)
        SELECT numMessagesExist - 1
        FROM Messages_Exist
        ORDER BY id DESC
        LIMIT 1;
END;

-- increment the number of dms exist
DROP TRIGGER IF EXISTS Stat_Dms_Exist;
CREATE TRIGGER Stat_Dms_Exist
AFTER INSERT ON Dms
BEGIN
    INSERT INTO Dms_Exist (numDmsExist)
        SELECT COUNT(*)
        FROM dms;
END;

DROP TRIGGER IF EXISTS Stat_Dms_Exist_On_Delete;
CREATE TRIGGER Stat_Dms_Exist_On_Delete
AFTER DELETE ON Dms
BEGIN
    INSERT INTO Dms_Exist (numDmsExist)
        SELECT COUNT(*)
        FROM dms;
END;

-- increment the number of channels
DROP TRIGGER IF EXISTS Stat_Channels_Exist;
CREATE TRIGGER Stat_Channels_Exist
AFTER INSERT ON Channels
BEGIN
    INSERT INTO Channels_Exist (numChannelsExist)
        SELECT COUNT(*)
        FROM Channels;
END;

DROP TRIGGER IF EXISTS Stat_Channels_Exist_On_Delete;
CREATE TRIGGER Stat_Channels_Exist_On_Delete
AFTER DELETE ON Channels
BEGIN
    INSERT INTO Channels_Exist (numChannelsExist)
        SELECT COUNT(*)
        FROM Channels;
END;