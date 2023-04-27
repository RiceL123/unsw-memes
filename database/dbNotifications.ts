import Database from 'better-sqlite3';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

interface Notification {
  channel: number;
  dm: number;
  message: string;
}

/**
 * getUserNotifications returns all the notifications for the specified user.
 *
 * @param {number} uId - the ID of the user.
 *
 * @returns {Array<{ channelId: number, dmId: number, notificationMessage: string }>} - an array of notifications
 * for the specified user.
 */
function getUserNotifications(uId: number)  {
  const stmt = db.prepare(`SELECT channel, dm, message FROM notifications WHERE user = ? ORDER BY id DESC`);
  const notifications = stmt.all(uId) as Notification[];
  
  return notifications.map(x => ({
    channelId: !x.channel ? -1 : x.channel,
    dmId: !x.dm ? -1 : x.dm,
    notificationMessage: x.message
  }));
}

export { getUserNotifications };