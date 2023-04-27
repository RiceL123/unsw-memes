import Database from 'better-sqlite3';
import HTTPError from 'http-errors';
import { getChannel, getChannelMembers, isChannelMember } from './dbChannels';
import { getDm, getDmMembers, isDmMember } from './dbDms';
import { Reacts } from '../src/dataStore';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

export interface ChannelMessage {
  id: number;
  user: number;
  channel: number;
  message: string;
  timeSent: number;
  isPinned: number;
}

export interface DmMessage {
  id: number;
  user: number;
  dm: number;
  message: string;
  timeSent: number;
  isPinned: number;
}

export interface React {
  reactId: number;
  user: number;
  message: number;
}

interface MessageOptions {
  id?: number;
  user?: number;
  channel?: number;
  dm?: number;
  message?: string;
  timeSent?: number;
  isPinned?: number;
}

/**
 * groupChannelMessageReacts takes a message ID and user ID and returns an array of React objects
 * containing information about the message reacts grouped by react ID.
 *
 * @param {number} messageId - the ID of the message to group reacts for.
 * @param {number} uId - the ID of the user to check if they have reacted to the message.
 *
 * @returns {React[]} - an array of React objects, each containing the react ID, an array of user IDs who have reacted with that react,
 * and a boolean indicating whether the specified user has reacted with that react.
 */
function groupChannelMessageReacts(messageId: number, uId: number) {
  const reacts = getChannelMessageReacts(messageId);

  const groupedReacts = reacts.reduce((acc, react) => {
    const { reactId, user } = react;
    const curGroup = acc[reactId]?.uIds ?? [];

    return { ...acc, [reactId]: { reactId, uIds: [...curGroup, user], isThisUserReacted: isThisUserReactedChannel(uId, messageId, reactId) } };
  }, {});

  // Convert the object to an array of grouped reacts
  return Object.values(groupedReacts) as Reacts[];
}

function insertChannelMessage(messageId: number, uId: number, channelId: number, message: string) {
  const stmt = db.prepare(`INSERT INTO channel_messages (id, user, channel, message) VALUES (?, ?, ?, ?)`);
  stmt.run(messageId, uId, channelId, message);
}

function removeChannelMessage(messageId: number) {
  const stmt = db.prepare(`DELETE FROM channel_messages WHERE id = ?`);
  stmt.run(messageId)
}

/**
 * updateChannelMessage updates a channel message with the specified message ID.
 * It accepts options object to update the message's properties such as message body,
 * pinned status, or reactions. If the message body is updated and contains a handle
 * (e.g., @username), it will generate a notification for the user. 
 *
 * @param {number} messageId - the ID of the message to update.
 * @param {object} options - the options object containing the message properties to update.
 * @param {number} [channelId] - the ID of the channel where the message belongs to.
 * @param {string} [editorHandle] - the handle of the user who edited the message.
 *
 * @returns {void}
 */
function updateChannelMessage(messageId: number, options: MessageOptions, channelId?: number, editorHandle?: string) {
  const keys = Object.keys(options);
  if (keys.length === 0) {
    throw HTTPError(405, 'At least one update option must be provided');
  }

  const setClauses = keys.map((key) => `${key} = ?`);
  const values = keys.map((key) => options[key as keyof MessageOptions]);

  const setClause = setClauses.join(', ');
  const stmt = db.prepare(`UPDATE channel_messages SET ${setClause} WHERE id = ?`);

  stmt.run(...values, messageId);

  // check if the message was updated, then check if there are 
  if (!('message' in options)) {
    return
  }

  const channelName = getChannel(channelId).name;

  for (const x of getChannelMembers(channelId)) {
    console.log(options.message);
    console.log(x.handleStr);
    if (options.message.includes(`@${x.handleStr}`)) {
      const stmt2 = db.prepare(`INSERT INTO notifications (user, channel, message) VALUES (?, ?, ?)`);
      stmt2.run(x.id, channelId, `${editorHandle} tagged you in ${channelName}: ${options.message.slice(0, 20)}`)
    }
  }
}

function getChannelMessage(messageId: number) {
  const stmt = db.prepare(`SELECT * FROM channel_messages WHERE id = ?`);
  const message = stmt.get(messageId);
  if (!message) {
    return null;
  }

  return message as ChannelMessage;
}

function getAllChannelMessages() {
  const stmt = db.prepare(`SELECT * FROM channel_messages`);
  const messages = stmt.all();
  return messages as ChannelMessage[];
}

function getChannelMessages(uId: number, channelId: number) {
  const stmt = db.prepare(`SELECT * FROM channel_messages WHERE channel = ? ORDER BY insertOrder DESC`);
  const messages = stmt.all(channelId) as ChannelMessage[];
  
  return messages.map(x => ({
    messageId: x.id,
    uId: x.user,
    message: x.message,
    timeSent: x.timeSent,
    reacts: groupChannelMessageReacts(x.id, uId),
    isPinned: !!x.isPinned
  }));
}

function insertChannelMessageReact(uId: number, uHandle: string, messageId: number, reactId: number, messageSenderId: number, channelId: number) {
  const stmt = db.prepare(`INSERT INTO Channel_Message_Reacts (user, message, reactId) VALUES (?, ?, ?)`);
  stmt.run(uId, messageId, reactId);

  // notify user who's message got reacted to if they didn't react to their own message
  if (uId !== messageSenderId && isChannelMember(messageSenderId, channelId)) {
    const channelName = getChannel(channelId).name;
    const stmt2 = db.prepare(`INSERT INTO Notifications (user, channel, message) VALUES (?, ?, ?)`);
    stmt2.run(messageSenderId, channelId, `${uHandle} reacted to your message in ${channelName}`)
  }
}

function removeChannelMessageReact(uId: number, messageId: number, reactId: number) {
  const stmt = db.prepare(`DELETE FROM Channel_Message_Reacts WHERE user = ? AND message = ? AND reactId = ?`);
  stmt.run(uId, messageId, reactId);
}

function getChannelMessageReacts(messageId: number) {
  const stmt = db.prepare(`SELECT * FROM Channel_Message_Reacts WHERE message = ?`);
  const reacts = stmt.all(messageId);
  return reacts as React[];
}

function isThisUserReactedChannel(uId: number, messageId: number, reactId: number) {
  const stmt = db.prepare(`SELECT * FROM Channel_Message_Reacts WHERE user = ? AND message = ? AND reactId = ?`);
  const row = stmt.get(uId, messageId, reactId);
  if (!row) {
    return false;
  }
  return true;
}

function updateUserChannelMessages(uId: number, message: string) {
  const stmt = db.prepare(`UPDATE channel_messages SET message = ? WHERE user = ?`);
  stmt.run(message, uId);
}

function getAllChannelMessagesWhereUserIsMember(uId: number) {
  const stmt = db.prepare(`
  SELECT msg.id, msg.user, msg.channel, msg.message, msg.timeSent, msg.isPinned
  FROM channel_messages AS msg
  INNER JOIN channel_members AS mem ON msg.channel = mem.channel
  WHERE mem.user = ?
  `);

  const messages = stmt.all(uId) as ChannelMessage[]; 

  return messages.map(x => ({
    messageId: x.id,
    uId: x.user,
    message: x.message,
    timeSent: x.timeSent,
    reacts: groupChannelMessageReacts(x.id, uId),
    isPinned: !!x.isPinned
  }));
}

// --------------------------------------------------------------------------------------- //

/**
 * groupDmMessageReacts groups the reactions for a DM message by react ID and returns an array of 
 * reaction objects containing the react ID, an array of user IDs who have reacted with that react,
 * and a boolean indicating whether or not the specified user has already reacted with that react.
 *
 * @param {number} messageId - the ID of the DM message.
 * @param {number} uId - the ID of the user whose reactions will be grouped.
 *
 * @returns {Array<Reacts>} - an array of objects containing the react ID, an array of user IDs who have 
 * reacted with that react, and a boolean indicating whether or not the specified user has already reacted 
 * with that react.
 */

function groupDmMessageReacts(messageId: number, uId: number) {
  const reacts = getDmMessageReacts(messageId);

  const groupedReacts = reacts.reduce((acc, react) => {
    const { reactId, user } = react;
    const curGroup = acc[reactId]?.uIds ?? [];

    return { ...acc, [reactId]: { reactId, uIds: [...curGroup, user], isThisUserReacted: isThisUserReactedDm(uId, messageId, reactId) } };
  }, {});

  // Convert the object to an array of grouped reacts
  return Object.values(groupedReacts) as Reacts[];
}

function insertDmMessage(messageId: number, uId: number, dmId: number, message: string) {
  const stmt = db.prepare(`INSERT INTO dm_messages (id, user, dm, message) VALUES (?, ?, ?, ?)`);
  stmt.run(messageId, uId, dmId, message);
}

function removeDmMessage(messageId: number) {
  const stmt = db.prepare(`DELETE FROM dm_messages WHERE id = ?`);
  stmt.run(messageId)
}

/**
 * updateDmMessage updates a direct message with the specified message ID
 *
 * @param {number} messageId - ID of the message to update
 * @param {MessageOptions} options - an object containing the properties to update
 * @param {number} dmId - optional ID of the direct message
 * @param {string} editorHandle - optional handle of the user who edited the message
 *
 * @throws {HTTPError} - when no update options are provided
 *
 * @returns {void}
 */
function updateDmMessage(messageId: number, options: MessageOptions, dmId?: number, editorHandle?: string) {
  const keys = Object.keys(options);
  if (keys.length === 0) {
    throw HTTPError(405, 'At least one update option must be provided');
  }

  const setClauses = keys.map((key) => `${key} = ?`);
  const values = keys.map((key) => options[key as keyof MessageOptions]);

  const setClause = setClauses.join(', ');
  const stmt = db.prepare(`UPDATE dm_messages SET ${setClause} WHERE id = ?`);

  const info = stmt.run(...values, messageId);

  // check if the updating message will send a notification
  if (!('message' in options)) {
    return
  }

  const dmName = getDm(dmId).name;

  for (const x of getDmMembers(dmId)) {
    if (options.message.includes(`@${x.handleStr}`)) {
      const stmt2 = db.prepare(`INSERT INTO notifications (user, dm, message) VALUES (?, ?, ?)`);
      stmt2.run(x.id, dmId, `${editorHandle} tagged you in ${dmName}: ${options.message.slice(0, 20)}`)
    }
  }
}

function getDmMessage(messageId: number) {
  const stmt = db.prepare(`SELECT * FROM Dm_messages WHERE id = ?`);
  const message = stmt.get(messageId);
  if (!message) {
    return null;
  }
  return message as DmMessage;
}

function getAllDmMessages() {
  const stmt = db.prepare(`SELECT * FROM Dm_messages`);
  const messages = stmt.all();
  return messages as DmMessage[];
}

function getDmMessages(uId: number, dmId: number) {
  const stmt = db.prepare(`SELECT * FROM dm_messages WHERE dm = ? ORDER BY insertOrder DESC`);
  const messages = stmt.all(dmId) as DmMessage[];

  return messages.map(x => ({
    messageId: x.id,
    uId: x.user,
    message: x.message,
    timeSent: x.timeSent,
    reacts: groupDmMessageReacts(x.id, uId),
    isPinned: !!x.isPinned
  }));
}

function insertDmMessageReact(uId: number, uHandle: string, messageId: number, reactId: number, messageSenderId: number, dmId: number) {
  const stmt = db.prepare(`INSERT INTO Dm_Message_Reacts (user, message, reactId) VALUES (?, ?, ?)`);
  stmt.run(uId, messageId, reactId);

  // notify user who's message got reacted to if they didn't react to their own message and they are still a member
  if (uId !== messageSenderId && isDmMember(messageSenderId, dmId)) {
    const dmName = getDm(dmId).name;
    const stmt2 = db.prepare(`INSERT INTO Notifications (user, dm, message) VALUES (?, ?, ?)`);
    stmt2.run(messageSenderId, dmId, `${uHandle} reacted to your message in ${dmName}`)
  }
}

function removeDmMessageReact(uId: number, messageId: number, reactId: number) {
  const stmt = db.prepare(`DELETE FROM Dm_Message_Reacts WHERE user = ? AND message = ? AND reactId = ?`);
  stmt.run(uId, messageId, reactId);
}

function getDmMessageReacts(messageId: number) {
  const stmt = db.prepare(`SELECT * FROM Dm_Message_Reacts WHERE message = ?`);
  const reacts = stmt.all(messageId);
  return reacts as React[];
}

function isThisUserReactedDm(uId: number, messageId: number, reactId: number) {
  const stmt = db.prepare(`SELECT * FROM Dm_Message_Reacts WHERE user = ? AND message = ? AND reactId = ?`);
  const row = stmt.get(uId, messageId, reactId);
  if (!row) {
    return false;
  }
  return true;
}

function updateUserDmMessages(uId: number, message: string) {
  const stmt = db.prepare(`UPDATE dm_messages SET message = ? WHERE user = ?`);
  stmt.run(message, uId);
}

function getAllDmMessagesWhereUserIsMember(uId: number) {
  const stmt = db.prepare(`
  SELECT msg.id, msg.user, msg.dm, msg.message, msg.timeSent, msg.isPinned
  FROM dm_messages AS msg
  INNER JOIN dm_members AS mem ON msg.dm = mem.dm
  WHERE mem.user = ?
  `);

  const messages = stmt.all(uId) as DmMessage[];

  return messages.map(x => ({
    messageId: x.id,
    uId: x.user,
    message: x.message,
    timeSent: x.timeSent,
    reacts: groupDmMessageReacts(x.id, uId),
    isPinned: !!x.isPinned
  }));
}

export {
  insertChannelMessage,
  removeChannelMessage,
  updateChannelMessage,
  getChannelMessage,
  getAllChannelMessages,
  getChannelMessages,
  insertChannelMessageReact,
  removeChannelMessageReact,
  getChannelMessageReacts,
  isThisUserReactedChannel,
  updateUserChannelMessages,
  getAllChannelMessagesWhereUserIsMember,
  insertDmMessage,
  removeDmMessage,
  updateDmMessage,
  getDmMessage,
  getAllDmMessages,
  getDmMessages,
  insertDmMessageReact,
  removeDmMessageReact,
  getDmMessageReacts,
  isThisUserReactedDm,
  updateUserDmMessages,
  getAllDmMessagesWhereUserIsMember
}