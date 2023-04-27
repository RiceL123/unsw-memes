import Database from 'better-sqlite3';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

interface MessagesSent {
  messagesSent: number;
  timeStamp: number;
}

interface ChannelStats {
  numChannels: number;
  timeStamp: number;
}

interface DmStats {
  numDms: number;
  timeStamp: number;
}

interface WorkspaceChannelStats {
  numChannelsExist: number;
  timeStamp: number;
}

interface WorkspaceDmStats {
  numDmsExist: number;
  timeStamp: number;
}

interface WorkspaceMessageStats {
  numMessagesExist: number;
  timeStamp: number
}

function getUserMessagesStats(uId: number) {
  const stmt = db.prepare(`SELECT messagesSent, timeStamp FROM Stat_Messages_Sent WHERE user = ?`);
  const numMessagesSent = stmt.all(uId) as MessagesSent[];
  return numMessagesSent.map(x => ({ numMessagesSent: x.messagesSent, timeStamp: x.timeStamp }));
}

function getUserChannelStats(uId: number) {
  const stmt = db.prepare(`SELECT numChannels, timeStamp FROM Stat_Channels_Joined WHERE user = ?`);
  const stats = stmt.all(uId) as ChannelStats[];
  return stats.map(x => ({ numChannelsJoined: x.numChannels, timeStamp: x.timeStamp }));
}

function getUserDmStats(uId: number) {
  const stmt = db.prepare(`SELECT numDms, timeStamp FROM Stat_Dms_Joined WHERE user = ?`);
  const stats = stmt.all(uId) as DmStats[];
  return stats.map(x => ({ numDmsJoined: x.numDms, timeStamp: x.timeStamp }));
}

function getWorkspaceChannelStats() {
  const stmt = db.prepare(`SELECT numChannelsExist, timeStamp FROM Channels_Exist`);
  const stats = stmt.all() as WorkspaceChannelStats[];
  return stats.map(x => ({ numChannelsExist: x.numChannelsExist, timeStamp: x.timeStamp }));
}

function getWorkspaceDmStats() {
  const stmt = db.prepare(`SELECT numDmsExist, timeStamp FROM Dms_Exist`);
  const stats = stmt.all() as WorkspaceDmStats[];
  return stats.map(x => ({numDmsExist: x.numDmsExist, timeStamp: x.timeStamp}));
}

function getWorkSpaceMessageStats() {
  const stmt = db.prepare(`SELECT numMessagesExist, timeStamp FROM Messages_Exist`);
  const stats = stmt.all() as WorkspaceMessageStats[];
  return stats.map(x => ({numMessagesExist: x.numMessagesExist, timeStamp: x.timeStamp}));
}

function getNumAllUsersJoinedAtLeastOneDmOrChannel() {
  const stmt = db.prepare(`
  SELECT user FROM channel_members
  UNION
  SELECT user FROM dm_members
  `);
  const users = stmt.all();
  return users.length;
}

export {
  getUserMessagesStats,
  getUserChannelStats,
  getUserDmStats,
  getWorkspaceChannelStats,
  getWorkspaceDmStats,
  getWorkSpaceMessageStats,
  getNumAllUsersJoinedAtLeastOneDmOrChannel
}