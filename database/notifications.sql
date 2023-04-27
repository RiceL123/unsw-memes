-- This file contains the triggers for notifications

-- Send a notification to all users who were tagged in a channel message
DROP TRIGGER IF EXISTS Notification_Channel_Tag;
CREATE TRIGGER Notification_Channel_Tag
AFTER INSERT ON Channel_Messages
BEGIN
    INSERT INTO Notifications (user, channel, message) 
    SELECT usertoNotify.id, NEW.channel, userNotificationFrom.handleStr || ' tagged you in ' || c.name || ': ' || substr(NEW.message, 1, 20)
    FROM Channel_Members AS m
    INNER JOIN Channels AS c ON c.id = m.channel
    INNER JOIN Users AS usertoNotify ON usertoNotify.id = m.user
    INNER JOIN Users AS userNotificationFrom ON userNotificationFrom.id = NEW.user
    WHERE NEW.message LIKE '%' || '@' || usertoNotify.handleStr || '%';
END;

-- send a notification to all users that were tagged in a dm_message 
DROP TRIGGER IF EXISTS Notification_Dm_Tag;
CREATE TRIGGER Notification_Dm_Tag
AFTER INSERT ON Dm_Messages
BEGIN
    INSERT INTO Notifications (user, dm, message) 
    SELECT usertoNotify.id, NEW.dm, userNotificationFrom.handleStr || ' tagged you in ' || d.name || ': ' || substr(NEW.message, 1, 20)
    FROM Dm_Members AS m
    INNER JOIN Dms AS d ON d.id = m.dm
    INNER JOIN Users AS usertoNotify ON usertoNotify.id = m.user
    INNER JOIN Users AS userNotificationFrom ON userNotificationFrom.id = NEW.user
    WHERE NEW.message LIKE '%' || '@' || usertoNotify.handleStr || '%';
END;