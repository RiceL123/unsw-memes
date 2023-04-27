import Database from 'better-sqlite3';
import HTTPError from 'http-errors';
import { User } from './dbUsers';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

interface Channel {
  id: number;
  name: string;
  isPublic: boolean;
  standupOwner: number;
  standupIsActive: boolean;
  standupTimeFinish: number;
}

function insertChannel(name: string, isPublic: boolean) {
  const isPublicNumber = isPublic ? 1 : 0;
  const stmt = db.prepare(`INSERT INTO channels (name, isPublic) VALUES (?, ?)`);
  const info = stmt.run(name, isPublicNumber);
  return info.lastInsertRowid as number;
}

interface ChannelOptions {
  name?: string;
  isPublic?: number;
  standupOwner?: number;
  standupIsActive?: number;
  standupTimeFinish?: number;
}

function updateChannel(channelId: number, options: ChannelOptions) {
  const keys = Object.keys(options);
  if (keys.length === 0) {
    throw HTTPError(405, 'At least one update option must be provided');
  }

  const setClauses = keys.map((key) => `${key} = ?`);
  const values = keys.map((key) => options[key as keyof ChannelOptions]);

  const setClause = setClauses.join(', ');
  const stmt = db.prepare(`UPDATE channels SET ${setClause} WHERE id = ?`);

  const info = stmt.run(...values, channelId);
  return info.changes;
}

function insertChannelMember(uId: number, channelId: number, inserterHandle?: string, channelName?: string) {
  const stmt = db.prepare(`INSERT INTO channel_members (user, channel) VALUES (?, ?)`);
  stmt.run(uId, channelId);

  if (inserterHandle && channelName) {
    const stmt2 = db.prepare(`INSERT INTO Notifications (user, channel, message) VALUES (?, ?, ?)`);
    stmt2.run(uId, channelId, `${inserterHandle} added you to ${channelName}`)
  }
}

function insertChannelOwner(uId: number, channelId: number) {
  const stmt = db.prepare(`INSERT INTO channel_owners (user, channel) VALUES (?, ?)`);
  stmt.run(uId, channelId);
}

function removeChannelMember(uId: number, channelId: number) {
  const stmt = db.prepare(`DELETE FROM channel_members WHERE user = ? AND channel = ?`);
  stmt.run(uId, channelId);
}

function removeChannelOwner(uId: number, channelId: number) {
  const stmt = db.prepare(`DELETE FROM channel_owners WHERE user = ? AND channel = ?`);
  stmt.run(uId, channelId);
}

function getChannel(channelId: number) {
  const stmt = db.prepare(`SELECT * FROM channels WHERE id = ?`);
  const row = stmt.get(channelId);
  if (!row) {
    return null;
  }

  return row as Channel; 
}

function getAllChannels() {
  const stmt = db.prepare(`SELECT * FROM channels`);
  const rows = stmt.all();
  return rows as Channel[]; 
}

function getUserChannels(uId: number) {
  const stmt = db.prepare(`
  SELECT c.id, c.name, c.isPublic, c.standupIsActive, c.standupTimeFinish
  FROM channels AS c
  INNER JOIN channel_members AS cm ON cm.channel = c.id
  WHERE cm.user = ?`);
  const channels = stmt.all(uId);
  return channels as Channel[];
}

function isChannelMember(uId: number, channelId: number): boolean {
  const stmt = db.prepare(`SELECT * FROM channel_members WHERE user = ? AND channel = ?`);
  const users = stmt.get(uId, channelId);
  if (!users) {
    return false;
  }
  return true;
}

function isChannelOwner(uId: number, channelId: number): boolean {
  const stmt = db.prepare(`SELECT * FROM channel_owners WHERE user = ? AND channel = ?`);
  const users = stmt.get(uId, channelId);
  if (!users) {
    return false;
  }
  return true;
}

function getChannelMembers(channelId: number) {
  const stmt = db.prepare(`
  SELECT u.id, u.email, u.password, u.nameFirst, u.nameLast, u.handleStr, u.permission, u.resetCode, u.profileImgUrl
  FROM channel_members AS c
  INNER JOIN users AS u ON c.user = u.id
  WHERE c.channel = ?
  `);
  const users = stmt.all(channelId);
  if (!users) {
    return null;
  }
  return users as User[];
}

function getChannelOwners(channelId: number) {
  const stmt = db.prepare(`
  SELECT u.id, u.email, u.password, u.nameFirst, u.nameLast, u.handleStr, u.permission, u.resetCode, u.profileImgUrl
  FROM channel_owners AS c
  INNER JOIN users AS u ON c.user = u.id
  WHERE c.channel = ?
  `);
  const users = stmt.all(channelId);
  return users as User[];
}

interface StandupMessage {
  message: string;
}

function insertStandupMessage(channelId: number, message: string) {
  const stmt = db.prepare(`INSERT INTO standups (channel, message) VALUES (?, ?)`);
  stmt.run(channelId, message);
}

function getStandupMessages(channelId: number) {
  const stmt = db.prepare(`SELECT message FROM standups WHERE channel = ?`);
  const standupMessages = stmt.all(channelId);
  return (standupMessages as StandupMessage[]).map(x => x.message);
}

function removeStandupMessages(channelId: number) {
  const stmt = db.prepare(`DELETE FROM standups WHERE channel = ?`);
  stmt.run(channelId);
}

function removeUserAsMemberOfAllChannels(uId: number) {
  const stmt = db.prepare(`DELETE FROM channel_members WHERE user = ?`);
  stmt.run(uId);
}

function removeUserAsOwnerOfAllChannels(uId: number) {
  const stmt = db.prepare(`DELETE FROM channel_owners WHERE user = ?`);
  stmt.run(uId);
}

export {
  insertChannel,
  updateChannel,
  insertChannelMember,
  insertChannelOwner,
  removeChannelMember,
  removeChannelOwner,
  getChannel,
  getAllChannels,
  getUserChannels,
  isChannelMember,
  isChannelOwner,
  getChannelMembers,
  getChannelOwners,
  insertStandupMessage,
  getStandupMessages,
  removeStandupMessages,
  removeUserAsMemberOfAllChannels,
  removeUserAsOwnerOfAllChannels
}