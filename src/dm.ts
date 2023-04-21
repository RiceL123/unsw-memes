import { Dm, Data, getData, setData, getHash } from './dataStore';
import HTTPError from 'http-errors';
import { notificationsSend } from './notifications';
interface Error {
  error: string;
}

interface DmDetailsReturn {
  name: string;
  members: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
}

/** given the data of the dataStore and an array of uIds
 * generates a string with handlestrings comma separated in
 * alphabetical order
 *
 * @param {number[]} uIds
 * @param {Data} data
 * @returns
 */
function generateDmName(uIds: number[], data: Data) {
  return data
    .users
    .filter(x => uIds.includes(x.uId))
    .map(x => x.handleStr)
    .sort((a, b) => a.localeCompare(b))
    .join(', ');
}

/** Given an array of uids and the user than calls the function, makes a
 * new dm with the creator and the members in the uIds array
 *
 * @param {string} token
 * @param {number[]} uIds
 *
 * @returns {{ dmId: number }}
 */
function dmCreateV2(token: string, uIds: number[]) {
  const data: Data = getData();
  token = getHash(token);

  const creatorObj = data.users.find(x => x.tokens.includes(token));
  if (!creatorObj) {
    throw HTTPError(403, 'invalid token');
  }

  uIds.push(creatorObj.uId);

  // check every uId in the array references a valid user
  if (!(uIds.every(x => data.users.some(y => y.uId === x)))) {
    throw HTTPError(400, 'invalid uId - does not refer to existing user');
  }

  // if each uId is not unique
  if (uIds.length !== new Set(uIds).size) {
    throw HTTPError(400, 'invalid uId - cannot contain duplicates');
  }

  // generate new unique dmId
  let newDmId = 1;
  if (data.dms.length > 0) {
    newDmId = Math.max.apply(null, data.dms.map(x => x.dmId)) + 1;
  }

  // generate dmName
  const newDmName = generateDmName(uIds, data);

  const newDmObj: Dm = {
    dmId: newDmId,
    dmName: newDmName,
    creatorId: creatorObj.uId,
    memberIds: uIds,
    messages: [],
  };

  data.dms.push(newDmObj);

  // notify all members expect for creator owner they were added to a dm
  const usersToNotify = uIds.filter(x => x !== creatorObj.uId);
  notificationsSend(data, usersToNotify, newDmId, -1, creatorObj.handleStr, newDmName, '', 'add');

  // update stats of all new users
  for (const user of uIds) {
    const userObj = data.users.find(x => x.uId === user);
    const numDmsJoined = userObj.stats.dms.at(-1).numDmsJoined + 1;
    userObj.stats.dms.push({ numDmsJoined: numDmsJoined, timeStamp: Math.floor(Date.now() / 1000) });
  }

  // update utilizationStats
  const numDmsExist = data.workspaceStats.dms.at(-1).numDmsExist + 1;
  data.workspaceStats.dms.push({ numDmsExist: numDmsExist, timeStamp: Math.floor(Date.now() / 1000) });

  setData(data);

  return { dmId: newDmId };
}

/** Given a token of user and dmId, removes an existing DM, so all members are
 * no longer in the DM. This can only be done by the original creator of the DM
 *
 * @param {string} token
 * @param {number} dmId
 * @returns
 */
function dmRemoveV2(token: string, dmId: number) {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    throw HTTPError(400, 'dmId does not refer to a valid DMn');
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  if (dmObj.creatorId !== userObj.uId) {
    throw HTTPError(403, 'The authorised user is not the original DM creator');
  }

  data.dms = data.dms.filter(x => x.dmId !== dmObj.dmId);

  // update stats of all new users
  for (const user of dmObj.memberIds) {
    const userObj = data.users.find(x => x.uId === user);
    const numDmsJoined = userObj.stats.dms.at(-1).numDmsJoined - 1; // minus 1 to whateva is the most recent number of dm joined
    userObj.stats.dms.push({ numDmsJoined: numDmsJoined, timeStamp: Math.floor(Date.now() / 1000) });
  }

  // update utilizationStats
  const numDmsExist = data.workspaceStats.dms.at(-1).numDmsExist - 1;
  data.workspaceStats.dms.push({ numDmsExist: numDmsExist, timeStamp: Math.floor(Date.now() / 1000) });

  const numMessagesExist = data.dms.flatMap(x => x.messages).length + data.channels.flatMap(x => x.messages).length; // recalculate number of messages
  data.workspaceStats.messages.push({ numMessagesExist: numMessagesExist, timeStamp: Math.floor(Date.now() / 1000) });

  setData(data);

  return {};
}

/** Given a dmId that the user is apart of, returns information about the channel's
 * name and the members of that channel
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{ name: string, members: User[] }}
 */
function dmDetailsV2(token: string, dmId: number): Error | DmDetailsReturn {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  const members = [];
  for (const memberId of dmObj.memberIds) {
    const userObj = data.users.find(x => x.uId === memberId);

    members.push({
      uId: userObj.uId,
      email: userObj.email,
      nameFirst: userObj.nameFirst,
      nameLast: userObj.nameLast,
      handleStr: userObj.handleStr,
      profileImgUrl: userObj.profileImgUrl
    });
  }

  return {
    name: dmObj.dmName,
    members: members
  };
}

/** dmLeaveV2 removes the corresponding user to the token argument from
 * the dm
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{}}
 */
function dmLeaveV2(token: string, dmId: number): Error | Record<string, never> {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  dmObj.memberIds = dmObj.memberIds.filter(x => x !== userObj.uId);

  // update stats of leaving user
  const numDmsJoined = userObj.stats.dms.at(-1).numDmsJoined - 1; // minus 1 to whateva is the most recent number of dm joined
  userObj.stats.dms.push({ numDmsJoined: numDmsJoined, timeStamp: Math.floor(Date.now() / 1000) });

  setData(data);
  return {};
}

/** Given the token of a user, returns the list of DMs that the user is
 * a member of.
 *
 * @param {string} token
 *
 * @returns {{dms}}
 */
function dmListV2(token: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const dmsArray = [];

  for (const dm of data.dms) {
    if (dm.memberIds.some((x: number) => x === userObj.uId)) {
      dmsArray.push({
        dmId: dm.dmId,
        name: dm.dmName,
      });
    }
  }

  setData(data);
  return { dms: dmsArray };
}

/**
 * dmMessagesV2 takes an authorised user as well as a channelId to access the messages
 * stored within that channel and given the start index, it uses pagination to return the messages
 * stored in an array of objects, pagination can return up to 50 messages at a time. If there are
 * no messages, the end index returned is -1 but if there are more messages stored, the end index
 * is "start + 50". Assuming that the messages array in dms is already sorted.
 *
 * @param {string} token - unique Id generated when registering a user
 * @param {number} dmId - unique Id generated when creating a new dm
 * @param {number} start - the index at which we start searching for messages via pagination
 *
 * @returns { messages: [{ messageId, uId, message, timeSent }], start, end } - returns an object
 * that has an array of objects called messages, the start index value as well as a new index for
 * end which either states that there are no more messages or there are more messages waiting.
 */

function dmMessagesV2(token: string, dmId: number, start: number) {
  const data = getData();
  token = getHash(token);

  const pagination = 50;

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  if (!(data.dms.some(x => x.dmId === dmId))) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  const dmObj = (data.dms.find(x => x.dmId === dmId));
  if (!(dmObj.memberIds.includes(userObj.uId))) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  if (start < 0 || start > dmObj.messages.length) {
    throw HTTPError(400, 'invalid start value');
  }

  // if start + pagination > messages.length -> slice will slice appropiately according to length
  const messages = dmObj.messages.slice(start, start + pagination);

  // for all the react objects where the uIds includes the callers uId, change the default
  // isThisUserReacted value from false to true
  messages.flatMap(x => x.reacts).forEach(x => {
    if (x.uIds.includes(userObj.uId)) {
      x.isThisUserReacted = true;
    }
  });

  const end = start + pagination >= dmObj.messages.length ? -1 : start + pagination;

  return {
    messages: messages,
    start: start,
    end: end,
  };
}

export { dmCreateV2, dmDetailsV2, dmLeaveV2, dmRemoveV2, dmListV2, dmMessagesV2 };
